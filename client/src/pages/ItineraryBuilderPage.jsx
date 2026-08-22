import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getCompleteItinerary, 
  createTripStop, 
  updateTripStop, 
  deleteTripStop, 
  reorderTripStops, 
  addItineraryActivity, 
  updateItineraryActivity, 
  deleteItineraryActivity, 
  reorderStopActivities 
} from '../services/itineraryService';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Search, 
  Compass, 
  Eye, 
  Check, 
  Globe,
  ArrowLeft
} from 'lucide-react';
import './ItineraryPages.css';

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();

  const [loading, setLoading] = useState(true);
  const [itineraryData, setItineraryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isEditStopOpen, setIsEditStopOpen] = useState(false);
  const [activeStopToEdit, setActiveStopToEdit] = useState(null);

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);
  const [cityActivities, setCityActivities] = useState([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [activeItineraryActToEdit, setActiveItineraryActToEdit] = useState(null);

  // Form states
  const [stopFormData, setStopFormData] = useState({
    cityId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [actFormData, setActFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    notes: '',
  });

  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    if (tripId) {
      loadItinerary();
      loadAllCities();
    }
  }, [tripId]);

  const loadItinerary = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getCompleteItinerary(tripId);
      if (res.success) {
        setItineraryData(res.data);
      }
    } catch (err) {
      console.error('Failed to load itinerary:', err);
      setErrorMsg(err.message || 'Failed to load trip itinerary.');
    }
    setLoading(false);
  };

  const loadAllCities = async () => {
    try {
      const res = await api.get('/cities?limit=100');
      if (res.data && res.data.success) {
        setAvailableCities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  // Helper date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // ===============================================
  // INITIALIZATION FLOW (Phase 3 -> Phase 4 Stops)
  // ===============================================
  const handleInitializeStops = async () => {
    if (!itineraryData?.trip?.destinations?.length) return;
    setLoading(true);
    try {
      const trip = itineraryData.trip;
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      const totalDays = Math.max(1, Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24)));
      const destCount = trip.destinations.length;
      const daysPerStop = Math.max(1, Math.floor(totalDays / destCount));

      let currentStart = new Date(tripStart);

      for (let i = 0; i < destCount; i++) {
        const dest = trip.destinations[i];
        const cityId = typeof dest === 'object' ? dest._id : dest;
        let currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + (daysPerStop - 1));
        if (i === destCount - 1 || currentEnd > tripEnd) {
          currentEnd = new Date(tripEnd);
        }

        await createTripStop(tripId, {
          cityId,
          startDate: currentStart.toISOString().split('T')[0],
          endDate: currentEnd.toISOString().split('T')[0],
          order: i,
        });

        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() + 1);
        if (currentStart > tripEnd) currentStart = new Date(tripEnd);
      }

      setSuccessMsg('Itinerary stops initialized from saved destinations!');
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize itinerary stops.');
    }
    setLoading(false);
  };

  // ===============================================
  // STOP ACTIONS
  // ===============================================
  const openAddStopModal = () => {
    const trip = itineraryData?.trip;
    setStopFormData({
      cityId: availableCities[0]?._id || '',
      startDate: trip?.startDate ? formatDateInput(trip.startDate) : '',
      endDate: trip?.endDate ? formatDateInput(trip.endDate) : '',
      notes: '',
    });
    setIsAddStopOpen(true);
  };

  const handleCreateStop = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createTripStop(tripId, stopFormData);
      setSuccessMsg('Stop added to itinerary successfully!');
      setIsAddStopOpen(false);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add stop');
    }
  };

  const openEditStopModal = (stop) => {
    setActiveStopToEdit(stop);
    setStopFormData({
      cityId: stop.cityId?._id || stop.cityId,
      startDate: formatDateInput(stop.startDate),
      endDate: formatDateInput(stop.endDate),
      notes: stop.notes || '',
    });
    setIsEditStopOpen(true);
  };

  const handleUpdateStop = async (e) => {
    e.preventDefault();
    if (!activeStopToEdit) return;
    setErrorMsg('');
    try {
      await updateTripStop(activeStopToEdit._id, {
        startDate: stopFormData.startDate,
        endDate: stopFormData.endDate,
        notes: stopFormData.notes,
      });
      setSuccessMsg('Stop updated successfully!');
      setIsEditStopOpen(false);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update stop');
    }
  };

  const handleDeleteStop = async (stopId, cityName) => {
    if (!window.confirm(`Are you sure you want to remove ${cityName} from this itinerary? Associated activities will also be removed.`)) return;
    try {
      await deleteTripStop(stopId);
      setSuccessMsg(`Stop ${cityName} removed.`);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete stop');
    }
  };

  const handleReorderStops = async (currentIndex, direction) => {
    const stops = [...(itineraryData?.stops || [])];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const temp = stops[currentIndex];
    stops[currentIndex] = stops[targetIndex];
    stops[targetIndex] = temp;

    const stopIds = stops.map((s) => s.stop._id);
    try {
      await reorderTripStops(tripId, stopIds);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reorder stops');
    }
  };

  // ===============================================
  // ACTIVITY ACTIONS
  // ===============================================
  const openAddActivityModal = async (stopData) => {
    setActiveStopForActivity(stopData);
    setSelectedActivity(null);
    setActFormData({
      date: formatDateInput(stopData.stop.startDate),
      startTime: '09:00',
      endTime: '11:00',
      notes: '',
    });

    try {
      const cityId = stopData.city?._id || stopData.stop.cityId;
      const res = await api.get(`/activities?cityId=${cityId}&limit=50`);
      if (res.data && res.data.success) {
        setCityActivities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load city activities:', err);
    }

    setIsAddActivityOpen(true);
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivity || !activeStopForActivity) return;
    setErrorMsg('');
    try {
      const res = await addItineraryActivity(activeStopForActivity.stop._id, {
        activityId: selectedActivity._id,
        date: actFormData.date,
        startTime: actFormData.startTime,
        endTime: actFormData.endTime,
        notes: actFormData.notes,
      });

      if (res.hasConflict) {
        alert(`Warning: Activity added with schedule conflict! ${res.conflicts[0]?.message}`);
      } else {
        setSuccessMsg('Activity added to itinerary day!');
      }

      setIsAddActivityOpen(false);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add activity');
    }
  };

  const openEditActivityModal = (itineraryAct) => {
    setActiveItineraryActToEdit(itineraryAct);
    setActFormData({
      date: formatDateInput(itineraryAct.date),
      startTime: itineraryAct.startTime,
      endTime: itineraryAct.endTime,
      notes: itineraryAct.notes || '',
    });
    setIsEditActivityOpen(true);
  };

  const handleUpdateActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activeItineraryActToEdit) return;
    setErrorMsg('');
    try {
      const res = await updateItineraryActivity(activeItineraryActToEdit._id, {
        date: actFormData.date,
        startTime: actFormData.startTime,
        endTime: actFormData.endTime,
        notes: actFormData.notes,
      });

      if (res.hasConflict) {
        alert(`Warning: Update saved with schedule conflict! ${res.conflicts[0]?.message}`);
      } else {
        setSuccessMsg('Activity timing updated!');
      }

      setIsEditActivityOpen(false);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update activity');
    }
  };

  const handleDeleteItineraryActivity = async (activityId, actName) => {
    if (!window.confirm(`Remove "${actName}" from this itinerary day?`)) return;
    try {
      await deleteItineraryActivity(activityId);
      setSuccessMsg('Activity removed from schedule.');
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove activity');
    }
  };

  const handleReorderActivities = async (stopId, activities, currentIndex, direction) => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    const list = [...activities];
    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;

    const activityIds = list.map((a) => a.itineraryActivity._id);
    try {
      await reorderStopActivities(stopId, activityIds);
      await loadItinerary();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reorder activities');
    }
  };

  const filteredCityActivities = cityActivities.filter((a) =>
    a.name.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.type.toLowerCase().includes(activitySearch.toLowerCase())
  );

  if (loading && !itineraryData) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-semibold">Loading Itinerary Engine...</p>
      </div>
    );
  }

  const trip = itineraryData?.trip;
  const stops = itineraryData?.stops || [];
  const hasConflicts = itineraryData?.hasConflicts;
  const conflicts = itineraryData?.conflicts || [];

  return (
    <div className="itinerary-page-container">
      {/* Messages */}
      {errorMsg && (
        <div className="alert-banner-box error">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
          {errorMsg.toLowerCase().includes('auth') || errorMsg.toLowerCase().includes('not found') ? (
            <Link to="/trips" className="btn-primary-action text-xs py-1 px-3">
              View All Trips
            </Link>
          ) : (
            <button onClick={() => setErrorMsg('')}><X size={16} /></button>
          )}
        </div>
      )}
      {successMsg && (
        <div className="alert-banner-box success">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
        </div>
      )}

      {/* Sub-nav Header Bar */}
      <div className="itinerary-header-card">
        <div className="header-info-group">
          <div className="flex items-center gap-2">
            <span className="engine-badge">
              Phase 4 Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">ID: {tripId}</span>
          </div>
          <h1 className="header-title-text">{trip?.name || 'Itinerary Builder'}</h1>
          <p className="header-sub-text">
            {formatDate(trip?.startDate)} — {formatDate(trip?.endDate)} • {stops.length} Scheduled Cities
          </p>
        </div>

        <div className="header-actions-row">
          <Link to={`/trips/${tripId}/cities`} className="nav-action-btn secondary">
            <MapPin size={14} />
            <span>Discover Cities</span>
          </Link>
          <Link to={`/trips/${tripId}/activities`} className="nav-action-btn secondary">
            <Compass size={14} />
            <span>Discover Activities</span>
          </Link>
          <Link to={`/trips/${tripId}/calendar`} className="nav-action-btn secondary">
            <Calendar size={14} />
            <span>Timeline View</span>
          </Link>
          <Link to={`/trips/${tripId}/itinerary`} className="nav-action-btn primary">
            <Eye size={14} />
            <span>View Final Itinerary</span>
          </Link>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {hasConflicts && (
        <div className="alert-banner-box warning">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm">Schedule Conflicts Detected ({conflicts.length})</h4>
            <ul className="mt-1 space-y-1">
              {conflicts.map((c, idx) => (
                <li key={idx}>• {c.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Phase 3 -> Phase 4 Destination Initialization Banner */}
      {stops.length === 0 && trip?.destinations?.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Destinations Ready for Itinerary Scheduling</span>
            </h3>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              You have {trip.destinations.length} destination(s) saved in Phase 3. Click below to automatically convert them into scheduled trip stops.
            </p>
          </div>
          <button
            onClick={handleInitializeStops}
            className="nav-action-btn primary shrink-0"
          >
            Initialize Stops Schedule
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="section-toolbar-row">
        <h2 className="section-heading-text">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Scheduled Cities & Stops</span>
        </h2>
        <button className="nav-action-btn primary" onClick={openAddStopModal}>
          <Plus size={15} />
          <span>Add Stop / Destination</span>
        </button>
      </div>

      {/* Stops & Days Section */}
      {stops.length === 0 ? (
        <div className="itinerary-empty-card">
          <div className="itinerary-empty-icon">
            <MapPin size={30} />
          </div>
          <h3 className="itinerary-empty-title">No destinations scheduled yet</h3>
          <p className="itinerary-empty-sub">
            Click "+ Add Stop / Destination" to schedule cities for your journey.
          </p>
          <button className="nav-action-btn primary" onClick={openAddStopModal}>
            <Plus size={15} />
            <span>Add Stop / Destination</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {stops.map((stopItem, index) => {
            const { stop, city, activities } = stopItem;
            return (
              <div key={stop._id} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                {/* Stop Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{city?.name || 'City Stop'}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                          {city?.country}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>{formatDate(stop.startDate)} — {formatDate(stop.endDate)}</span>
                        {stop.notes && <span className="italic text-slate-400">({stop.notes})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleReorderStops(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleReorderStops(index, 'down')}
                      disabled={index === stops.length - 1}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => openEditStopModal(stop)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                      title="Edit Stop Dates"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStop(stop._id, city?.name || 'City')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500"
                      title="Remove Stop"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Stop Activities List */}
                <div className="p-4 space-y-3">
                  {activities.length === 0 ? (
                    <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400">No activities planned for this city stop yet.</p>
                      <button
                        onClick={() => openAddActivityModal(stopItem)}
                        className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Activity
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activities.map((actItem, actIdx) => {
                        const { itineraryActivity, activity } = actItem;
                        return (
                          <div
                            key={itineraryActivity._id}
                            className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0 text-center">
                                {itineraryActivity.startTime} – {itineraryActivity.endTime}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{activity?.name || 'Activity'}</h4>
                                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                                    {activity?.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                  <span>📅 {formatDate(itineraryActivity.date)}</span>
                                  <span>⏱️ {activity?.durationMinutes || 60} mins</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    ₹{itineraryActivity.estimatedCost || activity?.cost || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => handleReorderActivities(stop._id, activities, actIdx, 'up')}
                                disabled={actIdx === 0}
                                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() => handleReorderActivities(stop._id, activities, actIdx, 'down')}
                                disabled={actIdx === activities.length - 1}
                                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                onClick={() => openEditActivityModal(itineraryActivity)}
                                className="p-1.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                                title="Edit Timing"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteItineraryActivity(itineraryActivity._id, activity?.name)}
                                className="p-1.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-red-500"
                                title="Remove Activity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => openAddActivityModal(stopItem)}
                    >
                      Add Activity to {city?.name}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD STOP */}
      {isAddStopOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Add City Stop</span>
              </h3>
              <button onClick={() => setIsAddStopOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select City</label>
                <select
                  value={stopFormData.cityId}
                  onChange={(e) => setStopFormData({ ...stopFormData, cityId: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Destination City</option>
                  {availableCities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={stopFormData.startDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, startDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={stopFormData.endDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, endDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stay at Shinjuku Prince Hotel"
                  value={stopFormData.notes}
                  onChange={(e) => setStopFormData({ ...stopFormData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddStopOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Add Stop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STOP */}
      {isEditStopOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Edit Stop Dates</span>
              </h3>
              <button onClick={() => setIsEditStopOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStop} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={stopFormData.startDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, startDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={stopFormData.endDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, endDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={stopFormData.notes}
                  onChange={(e) => setStopFormData({ ...stopFormData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditStopOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD ACTIVITY TO STOP */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Add Activity to {activeStopForActivity?.city?.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select an activity and assign its schedule timing</p>
              </div>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1 custom-scrollbar">
              {/* Activity Selection List */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Choose Activity</label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search city activities..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredCityActivities.map((act) => {
                    const isSelected = selectedActivity?._id === act._id;
                    return (
                      <div
                        key={act._id}
                        onClick={() => setSelectedActivity(act)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{act.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {act.type} • {act.durationMinutes || 60} mins • ₹{act.cost}
                          </p>
                        </div>
                        {isSelected && <Check size={16} className="text-cyan-600 dark:text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Input */}
              {selectedActivity && (
                <form onSubmit={handleAddActivitySubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-800 dark:text-cyan-300 flex justify-between items-center">
                    <span>Selected: <strong>{selectedActivity.name}</strong></span>
                    <span>₹{selectedActivity.cost}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        value={actFormData.date}
                        onChange={(e) => setActFormData({ ...actFormData, date: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={actFormData.startTime}
                        onChange={(e) => setActFormData({ ...actFormData, startTime: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                      <input
                        type="time"
                        value={actFormData.endTime}
                        onChange={(e) => setActFormData({ ...actFormData, endTime: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddActivityOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Add to Schedule
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT ACTIVITY TIMING */}
      {isEditActivityOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Edit Activity Schedule</span>
              </h3>
              <button onClick={() => setIsEditActivityOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateActivitySubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={actFormData.date}
                    onChange={(e) => setActFormData({ ...actFormData, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={actFormData.startTime}
                    onChange={(e) => setActFormData({ ...actFormData, startTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={actFormData.endTime}
                    onChange={(e) => setActFormData({ ...actFormData, endTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditActivityOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
