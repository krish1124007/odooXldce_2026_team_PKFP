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
        const list = res.data.data || [];
        setCityActivities(list);
        if (list.length > 0) {
          setSelectedActivity(list[0]);
        }
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
              ✨ Live Itinerary Builder
            </span>
          </div>
          <h1 className="header-title-text font-extrabold text-2xl">
            {trip?.name ? trip.name.charAt(0).toUpperCase() + trip.name.slice(1) : 'Itinerary Builder'}
          </h1>
          <p className="header-sub-text font-semibold">
            {formatDate(trip?.startDate)} — {formatDate(trip?.endDate)} • {stops.length} Scheduled Cities
          </p>
        </div>

        <div className="header-actions-row">
          <Link to={`/trips/${tripId}/cities`} className="btn-secondary">
            <MapPin size={14} />
            <span>Discover Cities</span>
          </Link>
          <Link to={`/trips/${tripId}/activities`} className="btn-secondary">
            <Compass size={14} />
            <span>Discover Activities</span>
          </Link>
          <Link to={`/trips/${tripId}/calendar`} className="btn-secondary">
            <Calendar size={14} />
            <span>Timeline View</span>
          </Link>
          <Link to={`/trips/${tripId}/itinerary`} className="btn-primary">
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
            className="btn-primary shrink-0"
          >
            Initialize Stops Schedule
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="section-toolbar-row">
        <h2 className="section-heading-text">
          <Globe className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <span>Scheduled Cities & Stops</span>
        </h2>
        <button className="btn-primary" onClick={openAddStopModal}>
          <Plus size={15} />
          <span>Add Stop / Destination</span>
        </button>
      </div>

      {/* Stops & Days Section */}
      {stops.length === 0 ? (
        <div className="itinerary-empty-card">
          <div className="itinerary-empty-icon">
            <MapPin size={32} />
          </div>
          <h3 className="itinerary-empty-title">No destinations scheduled yet</h3>
          <p className="itinerary-empty-sub">
            Click "+ Add Stop / Destination" to schedule cities for your journey.
          </p>
          <button className="btn-primary mt-2" onClick={openAddStopModal}>
            <Plus size={15} />
            <span>Add Stop / Destination</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {stops.map((stopItem, index) => {
            const { stop, city, activities } = stopItem;
            const sectionBudget = activities.reduce(
              (sum, a) => sum + (a.itineraryActivity.estimatedCost || a.activity?.cost || 0),
              0
            );

            return (
              <div key={stop._id} className="itinerary-stop-card">
                {/* Stop Header */}
                <div className="stop-card-header">
                  <div className="stop-title-row">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="stop-number-badge">
                        Stop {index + 1}
                      </span>
                      <h3 className="stop-city-title">
                        {city?.name || 'City Stop'}
                      </h3>
                      {city?.country && (
                        <span className="stop-country-tag">
                          {city.country}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleReorderStops(index, 'up')}
                        disabled={index === 0}
                        className="icon-btn-tool"
                        title="Move Stop Up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleReorderStops(index, 'down')}
                        disabled={index === stops.length - 1}
                        className="icon-btn-tool"
                        title="Move Stop Down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => openEditStopModal(stop)}
                        className="icon-btn-tool"
                        title="Edit Stop Dates"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStop(stop._id, city?.name || 'City')}
                        className="icon-btn-tool delete"
                        title="Remove Stop"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Dates & Budget Meta Row */}
                  <div className="stop-meta-pills-row">
                    <div className="stop-meta-pill">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      <span>{formatDate(stop.startDate)} — {formatDate(stop.endDate)}</span>
                    </div>

                    <div className="stop-meta-pill budget">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Est. Budget: ₹{sectionBudget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Stop Activities List */}
                <div className="p-5 space-y-3">
                  {activities.length === 0 ? (
                    <div className="stop-empty-act-box">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-500 flex items-center justify-center">
                        <Compass size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No activities yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add things to do in {city?.name || 'this stop'}</p>
                      </div>
                      <button
                        onClick={() => openAddActivityModal(stopItem)}
                        className="btn-secondary"
                      >
                        <Plus size={14} />
                        <span>Add Activity to {city?.name || 'Stop'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activities.map((actItem, actIdx) => {
                        const { itineraryActivity, activity } = actItem;
                        return (
                          <div
                            key={itineraryActivity._id}
                            className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-extrabold shrink-0 shadow-sm">
                                {itineraryActivity.startTime} – {itineraryActivity.endTime}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activity?.name || 'Activity'}</h4>
                                  {activity?.type && (
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold shrink-0">
                                      {activity.type}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} /> {formatDate(itineraryActivity.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} /> {activity?.durationMinutes || 60} mins
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    ₹{(itineraryActivity.estimatedCost || activity?.cost || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => handleReorderActivities(stop._id, activities, actIdx, 'up')}
                                disabled={actIdx === 0}
                                className="icon-btn-tool"
                                title="Move Up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() => handleReorderActivities(stop._id, activities, actIdx, 'down')}
                                disabled={actIdx === activities.length - 1}
                                className="icon-btn-tool"
                                title="Move Down"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                onClick={() => openEditActivityModal(itineraryActivity)}
                                className="icon-btn-tool"
                                title="Edit Timing"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteItineraryActivity(itineraryActivity._id, activity?.name)}
                                className="icon-btn-tool delete"
                                title="Remove Activity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add More Activities Row */}
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={() => openAddActivityModal(stopItem)}
                          className="btn-secondary text-xs py-2 px-5"
                        >
                          <Plus size={13} />
                          <span>Add Activity to {city?.name || 'Stop'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom Action Button: + Add Another Stop */}
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={openAddStopModal}
              className="btn-secondary py-2.5 px-6 text-xs"
            >
              <Plus size={15} />
              <span>Add Another Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STOP */}
      {isAddStopOpen && (
        <div className="gt-modal-overlay">
          <div className="gt-modal-card max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add City Stop</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Schedule a new city stop for your journey</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStopOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateStop} className="space-y-4 pt-1">
              <div className="gt-form-group">
                <label className="gt-form-label">Select Destination City</label>
                <select
                  value={stopFormData.cityId}
                  onChange={(e) => setStopFormData({ ...stopFormData, cityId: e.target.value })}
                  required
                  className="gt-form-select"
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
                <div className="gt-form-group">
                  <label className="gt-form-label">Start Date</label>
                  <input
                    type="date"
                    value={stopFormData.startDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, startDate: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
                <div className="gt-form-group">
                  <label className="gt-form-label">End Date</label>
                  <input
                    type="date"
                    value={stopFormData.endDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, endDate: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
              </div>

              <div className="gt-form-group">
                <label className="gt-form-label">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stay at Shinjuku Prince Hotel"
                  value={stopFormData.notes}
                  onChange={(e) => setStopFormData({ ...stopFormData, notes: e.target.value })}
                  className="gt-form-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStopOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Add Stop</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STOP */}
      {isEditStopOpen && (
        <div className="gt-modal-overlay">
          <div className="gt-modal-card max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Stop Dates</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Update schedule dates and notes for this stop</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditStopOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateStop} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="gt-form-group">
                  <label className="gt-form-label">Start Date</label>
                  <input
                    type="date"
                    value={stopFormData.startDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, startDate: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
                <div className="gt-form-group">
                  <label className="gt-form-label">End Date</label>
                  <input
                    type="date"
                    value={stopFormData.endDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, endDate: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
              </div>

              <div className="gt-form-group">
                <label className="gt-form-label">Notes</label>
                <input
                  type="text"
                  value={stopFormData.notes}
                  onChange={(e) => setStopFormData({ ...stopFormData, notes: e.target.value })}
                  className="gt-form-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditStopOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD ACTIVITY TO STOP */}
      {isAddActivityOpen && (
        <div className="gt-modal-overlay">
          <div className="gt-modal-card max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0">
                  <Compass size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add Activity to {activeStopForActivity?.city?.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Select an experience and assign its schedule timing</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddActivityOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1 custom-scrollbar pt-2">
              {/* Activity Selection List */}
              <div className="gt-form-group">
                <label className="gt-form-label">Choose Activity</label>
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Search city activities..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    className="gt-form-input"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {filteredCityActivities.map((act) => {
                    const isSelected = selectedActivity?._id === act._id;
                    return (
                      <div
                        key={act._id}
                        onClick={() => setSelectedActivity(act)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-slate-800 border-2 border-blue-600 dark:border-cyan-400 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">{act.name}</p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-semibold text-blue-600 dark:text-cyan-400">{act.type}</span> • {act.durationMinutes || 60} mins • <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(act.cost || 0).toLocaleString()}</span>
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-extrabold flex items-center gap-1">
                            <Check size={13} /> Selected
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold hover:text-blue-600">Select</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Input */}
              {selectedActivity && (
                <form onSubmit={handleAddActivitySubmit} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-xl text-xs text-blue-900 dark:text-cyan-300 flex justify-between items-center font-bold">
                    <span>Selected: {selectedActivity.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{selectedActivity.cost}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="gt-form-group">
                      <label className="gt-form-label">Date</label>
                      <input
                        type="date"
                        value={actFormData.date}
                        onChange={(e) => setActFormData({ ...actFormData, date: e.target.value })}
                        required
                        className="gt-form-input"
                      />
                    </div>
                    <div className="gt-form-group">
                      <label className="gt-form-label">Start Time</label>
                      <input
                        type="time"
                        value={actFormData.startTime}
                        onChange={(e) => setActFormData({ ...actFormData, startTime: e.target.value })}
                        required
                        className="gt-form-input"
                      />
                    </div>
                    <div className="gt-form-group">
                      <label className="gt-form-label">End Time</label>
                      <input
                        type="time"
                        value={actFormData.endTime}
                        onChange={(e) => setActFormData({ ...actFormData, endTime: e.target.value })}
                        required
                        className="gt-form-input"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddActivityOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={15} />
                      <span>Add to Schedule</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT ACTIVITY TIMING */}
      {isEditActivityOpen && (
        <div className="gt-modal-overlay">
          <div className="gt-modal-card max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Schedule Timing</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Update scheduled date and timing slots</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditActivityOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateActivitySubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="gt-form-group">
                  <label className="gt-form-label">Date</label>
                  <input
                    type="date"
                    value={actFormData.date}
                    onChange={(e) => setActFormData({ ...actFormData, date: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
                <div className="gt-form-group">
                  <label className="gt-form-label">Start Time</label>
                  <input
                    type="time"
                    value={actFormData.startTime}
                    onChange={(e) => setActFormData({ ...actFormData, startTime: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
                <div className="gt-form-group">
                  <label className="gt-form-label">End Time</label>
                  <input
                    type="time"
                    value={actFormData.endTime}
                    onChange={(e) => setActFormData({ ...actFormData, endTime: e.target.value })}
                    required
                    className="gt-form-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditActivityOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Save Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
