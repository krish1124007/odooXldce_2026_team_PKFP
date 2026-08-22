import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getCompleteItinerary, 
  updateItineraryActivity, 
  deleteItineraryActivity 
} from '../services/itineraryService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import './ItineraryPages.css';

export default function CalendarTimelinePage() {
  const { tripId } = useParams();

  const [loading, setLoading] = useState(true);
  const [itineraryData, setItineraryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Expandable days state
  const [expandedDays, setExpandedDays] = useState({});
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

  // Quick edit modal state
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  useEffect(() => {
    if (tripId) {
      fetchData();
    }
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getCompleteItinerary(tripId);
      if (res.success) {
        setItineraryData(res.data);
        // Expand all days by default
        const stops = res.data.stops || [];
        const initialExpanded = {};
        stops.forEach((s) => {
          s.activities.forEach((act) => {
            const dateKey = new Date(act.itineraryActivity.date).toISOString().split('T')[0];
            initialExpanded[dateKey] = true;
          });
        });
        setExpandedDays(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to load timeline:', err);
      setErrorMsg(err.message || 'Failed to load timeline data');
    }
    setLoading(false);
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateInput = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toISOString().split('T')[0];
  };

  const toggleDayExpand = (dateKey) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Open Quick Edit Modal
  const openQuickEdit = (item) => {
    setEditingActivity(item);
    setEditFormData({
      date: formatDateInput(item.itineraryActivity.date),
      startTime: item.itineraryActivity.startTime,
      endTime: item.itineraryActivity.endTime,
      notes: item.itineraryActivity.notes || '',
    });
    setIsQuickEditOpen(true);
  };

  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingActivity) return;
    setErrorMsg('');
    try {
      const res = await updateItineraryActivity(editingActivity.itineraryActivity._id, editFormData);
      if (res.hasConflict) {
        alert(`Schedule update saved, but conflict detected: ${res.conflicts[0]?.message}`);
      } else {
        setSuccessMsg('Schedule updated successfully!');
      }
      setIsQuickEditOpen(false);
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update schedule');
    }
  };

  const handleDeleteActivity = async (activityId, name) => {
    if (!window.confirm(`Remove "${name}" from schedule?`)) return;
    try {
      await deleteItineraryActivity(activityId);
      setSuccessMsg('Activity removed from schedule.');
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove activity');
    }
  };

  if (loading && !itineraryData) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold">
        <div className="gt-spinner-lg mx-auto mb-4"></div>
        <p className="text-sm">Loading Timeline & Conflict Engine...</p>
      </div>
    );
  }

  const trip = itineraryData?.trip;
  const stops = itineraryData?.stops || [];
  const hasConflicts = itineraryData?.hasConflicts;
  const conflicts = itineraryData?.conflicts || [];

  // Group activities by date
  const dateMap = {};
  stops.forEach((stopItem) => {
    const { city, activities } = stopItem;
    activities.forEach((actItem) => {
      const dateKey = new Date(actItem.itineraryActivity.date).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = [];
      }
      dateMap[dateKey].push({
        ...actItem,
        cityName: city?.name || 'Destination',
      });
    });
  });

  const sortedDates = Object.keys(dateMap).sort();

  const filteredDates = selectedDayFilter === 'ALL'
    ? sortedDates
    : sortedDates.filter((d, idx) => `DAY_${idx + 1}` === selectedDayFilter);

  return (
    <div className="itinerary-page-container">
      {/* Notifications */}
      {errorMsg && (
        <div className="alert-banner-box error">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={16} /></button>
        </div>
      )}
      {successMsg && (
        <div className="alert-banner-box success">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
        </div>
      )}

      {/* Header Bar */}
      <div className="itinerary-header-card">
        <div>
          <Link
            to={`/trips/${tripId}/builder`}
            className="back-link-btn text-xs mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Builder</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="engine-badge">
              Calendar & Timeline
            </span>
          </div>
          <h1 className="header-title-text">{trip?.name || 'Trip Schedule'}</h1>
          <p className="header-sub-text mt-1">
            Day-by-day visual timeline with conflict detection & expandable schedule cards
          </p>
        </div>

        <div className="header-actions-row">
          <Link to={`/trips/${tripId}/itinerary`} className="nav-action-btn primary">
            <CalendarIcon size={14} />
            <span>View Full Itinerary</span>
          </Link>
          <Link to={`/trips/${tripId}/builder`}>
            <Button variant="primary" size="sm" icon={Edit3}>
              Edit Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {hasConflicts && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-900 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Schedule Overlaps Detected</h4>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              The deterministic engine identified {conflicts.length} overlapping time slot(s). Use quick edit to adjust start/end times.
            </p>
            <ul className="mt-2 space-y-1 text-amber-800 dark:text-amber-300 font-medium">
              {conflicts.map((c, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>• {c.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Day Selector Pills */}
      {sortedDates.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedDayFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedDayFilter === 'ALL'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Days ({sortedDates.length})
          </button>
          {sortedDates.map((dateStr, idx) => (
            <button
              key={dateStr}
              onClick={() => setSelectedDayFilter(`DAY_${idx + 1}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedDayFilter === `DAY_${idx + 1}`
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Day {idx + 1} ({formatDate(dateStr)})
            </button>
          ))}
        </div>
      )}

      {/* Vertical Timeline View */}
      {filteredDates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <CalendarIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">No scheduled timeline items</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Schedule activities on the Itinerary Builder page to view them on the timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDates.map((dateKey) => {
            const dayIdx = sortedDates.indexOf(dateKey);
            const isExpanded = expandedDays[dateKey] ?? true;
            const dayActivities = dateMap[dateKey];

            return (
              <div key={dateKey} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                {/* Expandable Day Header */}
                <div
                  onClick={() => toggleDayExpand(dateKey)}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950/80 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center">
                      D{dayIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{formatDate(dateKey)}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({dayActivities.length} activities)</span>
                      </h3>
                    </div>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {/* Timeline Items */}
                {isExpanded && (
                  <div className="p-5 relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 ml-6 my-2 space-y-4">
                    {dayActivities.map((item) => {
                      const { itineraryActivity, activity, cityName } = item;
                      
                      // Check if this item is part of a conflict
                      const itemConflict = conflicts.find(
                        (c) => c.activityAId === itineraryActivity._id || c.activityBId === itineraryActivity._id
                      );

                      return (
                        <div
                          key={itineraryActivity._id}
                          className={`relative p-4 rounded-xl border transition-all ${
                            itemConflict
                              ? 'bg-amber-500/10 border-amber-500/40'
                              : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Timeline Dot */}
                          <div
                            className={`absolute -left-[37px] top-5 w-4 h-4 rounded-full border-2 ${
                              itemConflict
                                ? 'bg-amber-500 border-amber-400 animate-pulse'
                                : 'bg-cyan-500 border-white dark:border-slate-900'
                            }`}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start space-x-3">
                              <div className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 shrink-0">
                                {itineraryActivity.startTime} – {itineraryActivity.endTime}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activity?.name}</h4>
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-[10px] font-semibold">
                                    📍 {cityName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                  <span>⏱️ {activity?.durationMinutes || 60} mins</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{itineraryActivity.estimatedCost}</span>
                                </div>

                                {itemConflict && (
                                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Overlap: {itemConflict.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => openQuickEdit(item)}
                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-all"
                              >
                                <Edit3 size={13} />
                                <span>Quick Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(itineraryActivity._id, activity?.name)}
                                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {isQuickEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Quick Edit Schedule</span>
              </h3>
              <button onClick={() => setIsQuickEditOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Activity:</span>{' '}
                <strong className="text-slate-900 dark:text-white">{editingActivity?.activity?.name}</strong>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsQuickEditOpen(false)}>
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
