import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompleteItinerary } from '../services/itineraryService';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Share2, 
  Edit3, 
  Calendar as CalendarIcon, 
  List, 
  MapPin, 
  Clock, 
  DollarSign, 
  Sparkles, 
  X,
  Compass,
  ArrowLeft
} from 'lucide-react';
import './ItineraryPages.css';

export default function ItineraryViewPage() {
  const { tripId } = useParams();

  const [loading, setLoading] = useState(true);
  const [itineraryData, setItineraryData] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedActivityForModal, setSelectedActivityForModal] = useState(null);

  useEffect(() => {
    if (tripId) {
      fetchData();
    }
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCompleteItinerary(tripId);
      if (res.success) {
        setItineraryData(res.data);
      }
    } catch (err) {
      console.error('Failed to load itinerary view:', err);
    }
    setLoading(false);
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !itineraryData) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold">
        <div className="gt-spinner-lg mx-auto mb-4"></div>
        <p className="text-sm">Generating Itinerary View...</p>
      </div>
    );
  }

  const trip = itineraryData?.trip;
  const stops = itineraryData?.stops || [];
  
  // Aggregate all activities across stops grouped by date
  const dateMap = {};
  let totalActivitiesCount = 0;

  stops.forEach((stopItem) => {
    const { city, activities } = stopItem;
    activities.forEach((actItem) => {
      totalActivitiesCount++;
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

  // Calendar dates generator
  const getCalendarDates = () => {
    if (!trip?.startDate || !trip?.endDate) return [];
    const dates = [];
    let curr = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const calendarDates = getCalendarDates();

  return (
    <div className="itinerary-page-container">
      {/* Header Bar */}
      <div className="itinerary-header-card">
        <div>
          <Link
            to="/trips"
            className="back-link-btn text-xs mb-2"
          >
            <ArrowLeft size={14} />
            <span>My Trips</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="engine-badge">
              Full Itinerary Overview
            </span>
          </div>
          <h1 className="header-title-text">{trip?.name || 'Trip Itinerary'}</h1>
          <p className="header-sub-text flex flex-wrap items-center gap-3 mt-1">
            <span>📅 {formatDate(trip?.startDate)} — {formatDate(trip?.endDate)}</span>
            <span>📍 {stops.length} Cities</span>
            <span>🎯 {totalActivitiesCount} Activities Planned</span>
          </p>
        </div>

        <div className="header-actions-row">
          {/* Publish / Visibility Toggle */}
          {trip?.visibility === 'PUBLIC' ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                🌐 Public
              </span>
              <button
                onClick={async () => {
                  try {
                    const res = await api.put(`/trips/${tripId}/unpublish`);
                    if (res.data?.success) {
                      fetchData();
                    }
                  } catch (err) {
                    alert('Failed to unpublish trip');
                  }
                }}
                className="nav-action-btn secondary text-xs"
              >
                Unpublish
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/public/trips/${trip?.publicId || trip?._id}`;
                  navigator.clipboard.writeText(url);
                  alert(`Public link copied: ${url}`);
                }}
                className="nav-action-btn primary text-xs"
              >
                <Share2 size={14} /> Copy Link
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                if (!window.confirm('Anyone with the public link will be able to view this itinerary. Confirm publishing?')) return;
                try {
                  const res = await api.put(`/trips/${tripId}/publish`);
                  if (res.data?.success) {
                    fetchData();
                    const url = `${window.location.origin}${res.data.data.publicUrl}`;
                    navigator.clipboard.writeText(url);
                    alert(`Trip is now PUBLIC!\n\nShare link copied to clipboard:\n${url}`);
                  }
                } catch (err) {
                  alert('Failed to publish trip');
                }
              }}
              className="nav-action-btn primary text-xs"
            >
              🌐 Publish Trip
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="select-control-box p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List size={14} />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Calendar View</span>
            </button>
          </div>

          <Link to={`/trips/${tripId}/builder`}>
            <Button variant="primary" size="sm" icon={Edit3}>
              Open Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* LIST VIEW MODE */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <Compass className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">No scheduled activities yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Head over to the Itinerary Builder to schedule activities for your days.
              </p>
              <Link to={`/trips/${tripId}/builder`}>
                <Button variant="primary" size="sm" icon={Edit3} className="mt-2">
                  Go to Itinerary Builder
                </Button>
              </Link>
            </div>
          ) : (
            sortedDates.map((dateKey, dateIdx) => {
              const dayActivities = dateMap[dateKey];
              return (
                <div key={dateKey} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  {/* Day Header */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs">
                        DAY {dateIdx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(dateKey)}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{dayActivities.length} Activities Scheduled</p>
                      </div>
                    </div>
                  </div>

                  {/* Day Activities List */}
                  <div className="p-4 space-y-3">
                    {dayActivities.map((item) => {
                      const { itineraryActivity, activity, cityName } = item;
                      return (
                        <div
                          key={itineraryActivity._id}
                          onClick={() => setSelectedActivityForModal(item)}
                          className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                              {itineraryActivity.startTime} – {itineraryActivity.endTime}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activity?.name}</h4>
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-[10px] font-semibold">
                                  📍 {cityName}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-semibold">
                                  {activity?.type}
                                </span>
                              </div>
                              {activity?.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock size={13} /> {activity?.durationMinutes || 60} mins
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              ₹{itineraryActivity.estimatedCost || activity?.cost || 0}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CALENDAR VIEW MODE */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Trip Calendar Schedule</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {calendarDates.length} Days ({formatDateShort(trip?.startDate)} – {formatDateShort(trip?.endDate)})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarDates.map((dateStr, idx) => {
              const dayActs = dateMap[dateStr] || [];
              return (
                <div
                  key={dateStr}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 flex flex-col min-h-[160px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Day {idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDateShort(dateStr)}</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayActs.length === 0 ? (
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 italic py-3 text-center">No activities planned</p>
                    ) : (
                      dayActs.map((item) => {
                        const { itineraryActivity, activity, cityName } = item;
                        return (
                          <div
                            key={itineraryActivity._id}
                            onClick={() => setSelectedActivityForModal(item)}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer text-xs space-y-1 transition-all"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                              <span className="truncate">{activity?.name}</span>
                              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 shrink-0 ml-1">{itineraryActivity.startTime}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span>📍 {cityName}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{itineraryActivity.estimatedCost}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivityForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold uppercase">
                  {selectedActivityForModal.activity?.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedActivityForModal.activity?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">📍 {selectedActivityForModal.cityName}</p>
              </div>
              <button onClick={() => setSelectedActivityForModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Scheduled Date:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedActivityForModal.itineraryActivity.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Time Slot:</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {selectedActivityForModal.itineraryActivity.startTime} – {selectedActivityForModal.itineraryActivity.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedActivityForModal.activity?.durationMinutes || 60} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Cost:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedActivityForModal.itineraryActivity.estimatedCost}</span>
                </div>
              </div>

              {selectedActivityForModal.activity?.description && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-200 mb-1">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedActivityForModal.activity.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedActivityForModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
