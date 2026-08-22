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
  ChevronLeft,
  X, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Filter,
  Search,
  Layers,
  ArrowUpDown,
  MapPin,
  Plus,
  List,
  Grid
} from 'lucide-react';
import './CalendarPage.css';

export default function CalendarTimelinePage() {
  const { tripId } = useParams();

  const [loading, setLoading] = useState(true);
  const [itineraryData, setItineraryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Mode: 'calendar' (7-col monthly grid) or 'timeline' (vertical list)
  const [viewMode, setViewMode] = useState('calendar');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [sortBy, setSortBy] = useState('time');

  // Current Calendar Month & Year State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');

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
        // Set initial selected date to trip's start date or first activity date
        const trip = res.data?.trip;
        if (trip?.startDate) {
          const startDateObj = new Date(trip.startDate);
          setCurrentDate(startDateObj);
          setSelectedDateStr(startDateObj.toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load calendar itinerary:', err);
      setErrorMsg(err.message || 'Failed to load itinerary calendar data');
    }
    setLoading(false);
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateInput = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toISOString().split('T')[0];
  };

  // Month Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Quick Edit Modal Handlers
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
        <p className="text-sm">Loading Trip Calendar & Daily Plans...</p>
      </div>
    );
  }

  const trip = itineraryData?.trip;
  const stops = itineraryData?.stops || [];
  const hasConflicts = itineraryData?.hasConflicts;
  const conflicts = itineraryData?.conflicts || [];

  // Group activities by ISO Date String (YYYY-MM-DD)
  const dateMap = {};
  let totalActivitiesCount = 0;
  let totalEstimatedCostSum = 0;

  stops.forEach((stopItem) => {
    const { city, activities } = stopItem;
    activities.forEach((actItem) => {
      totalActivitiesCount++;
      totalEstimatedCostSum += Number(actItem.itineraryActivity.estimatedCost || 0);

      const dateKey = new Date(actItem.itineraryActivity.date).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = [];
      }
      dateMap[dateKey].push({
        ...actItem,
        cityName: city?.name || 'Destination',
        cityId: city?._id
      });
    });
  });

  // Calculate Calendar Grid Days for Current Month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = lastDayOfMonth.getDate();

  // Create Grid Cells Array
  const calendarCells = [];

  // Padding cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ isCurrentMonth: false, dateNumber: null, dateStr: null });
  }

  // Active Month Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().split('T')[0];
    calendarCells.push({
      isCurrentMonth: true,
      dateNumber: day,
      dateStr,
      dateObj,
      activities: dateMap[dateStr] || []
    });
  }

  const monthYearTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Selected Day Items
  const selectedDayItems = selectedDateStr ? (dateMap[selectedDateStr] || []) : [];
  const selectedDayStopCity = selectedDayItems[0]?.cityName;

  return (
    <div className="calendar-screen-wrapper">
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
      <div className="calendar-header-card">
        <div>
          <Link to={`/trips/${tripId}/builder`} className="back-link-btn mb-1">
            <ArrowLeft size={14} />
            <span>Back to Builder</span>
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="screen-title text-slate-900">Calendar View</h1>
            <div className="view-toggle-bar">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              >
                <CalendarIcon size={14} />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`view-toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              >
                <List size={14} />
                <span>Timeline</span>
              </button>
            </div>
          </div>
          <p className="screen-subtitle">
            Visualize your trip and daily plans across dates.
          </p>
          {trip?.name && (
            <p className="trip-context-tag">
              {trip.name} • {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </p>
          )}
        </div>

        <div className="header-actions-row">
          <button
            onClick={() => alert('✨ AI Schedule Assistant will reorder activities and resolve overlaps in Phase 6.')}
            className="nav-action-btn ai-btn"
          >
            <Sparkles size={14} />
            <span>✨ Optimize Schedule</span>
          </button>
          <Link to={`/trips/${tripId}/itinerary`} className="nav-action-btn outline">
            <span>View Full Itinerary →</span>
          </Link>
          <Link to={`/trips/${tripId}/budget`} className="nav-action-btn outline">
            <span>View Budget →</span>
          </Link>
        </div>
      </div>

      {/* Trip Itinerary Summary Pills */}
      <div className="calendar-summary-bar">
        <div className="summary-pill">
          <span className="pill-label">Stops</span>
          <span className="pill-val">{stops.length} Cities</span>
        </div>
        <div className="summary-pill">
          <span className="pill-label">Activities</span>
          <span className="pill-val">{totalActivitiesCount} Planned</span>
        </div>
        <div className="summary-pill">
          <span className="pill-label">Est. Cost</span>
          <span className="pill-val">₹{totalEstimatedCostSum.toLocaleString()}</span>
        </div>
        {hasConflicts && (
          <div className="summary-pill alert">
            <AlertTriangle size={14} />
            <span>{conflicts.length} Overlapping Slot(s)</span>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar (Screen 11 Wireframe Layout) */}
      <div className="calendar-controls-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search itinerary activities or cities..."
            className="search-field"
          />
        </div>

        <div className="controls-right">
          <div className="control-box">
            <Layers size={14} className="icon" />
            <select className="select-input">
              <option value="day">Group By: Day</option>
              <option value="city">Group By: City</option>
            </select>
          </div>

          <div className="control-box">
            <Filter size={14} className="icon" />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="select-input"
            >
              <option value="">Filter City: All</option>
              {stops.map((s) => (
                <option key={s.stop._id} value={s.city?.name}>
                  {s.city?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-box">
            <ArrowUpDown size={14} className="icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-input"
            >
              <option value="time">Sort By: Start Time</option>
              <option value="cost">Sort By: Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: MONTHLY CALENDAR GRID (Screen 11 Primary Requirement) */}
      {viewMode === 'calendar' ? (
        <div className="calendar-main-grid-container">
          {/* Calendar Month Header Controls */}
          <div className="calendar-month-header">
            <div className="flex items-center gap-2">
              <h2 className="month-title-text">{monthYearTitle}</h2>
              <button type="button" onClick={goToToday} className="btn-today">
                Today
              </button>
            </div>

            <div className="month-nav-btns">
              <button type="button" onClick={prevMonth} className="btn-month-nav" title="Previous Month">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={nextMonth} className="btn-month-nav" title="Next Month">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Row Header */}
          <div className="weekday-grid-header">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* 7-Column Date Cells Grid */}
          <div className="date-cells-grid">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="date-cell disabled" />;
              }

              const isSelected = selectedDateStr === cell.dateStr;
              const hasItems = cell.activities.length > 0;
              const cityLabel = cell.activities[0]?.cityName;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`date-cell ${isSelected ? 'selected' : ''} ${hasItems ? 'has-activities' : ''}`}
                >
                  <div className="cell-top-row">
                    <span className="date-number">{cell.dateNumber}</span>
                    {cityLabel && (
                      <span className="city-cell-badge">
                        <MapPin size={9} />
                        <span>{cityLabel}</span>
                      </span>
                    )}
                  </div>

                  {/* Compact Activity Indicators */}
                  <div className="cell-activities-stack">
                    {cell.activities.slice(0, 2).map((item) => (
                      <div key={item.itineraryActivity._id} className="compact-act-pill">
                        <span className="act-time">{item.itineraryActivity.startTime}</span>
                        <span className="act-title truncate">{item.activity?.name}</span>
                      </div>
                    ))}
                    {cell.activities.length > 2 && (
                      <div className="more-acts-tag">
                        +{cell.activities.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Selected Day Detail Panel */}
          {selectedDateStr && (
            <div className="selected-day-detail-panel">
              <div className="day-panel-header">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Selected Day Plan</span>
                  <h3 className="day-panel-date">
                    {formatDate(selectedDateStr)} {selectedDayStopCity && `• 📍 ${selectedDayStopCity}`}
                  </h3>
                </div>
                <Link to={`/trips/${tripId}/builder`} className="btn-add-activity-panel">
                  <Plus size={14} />
                  <span>Add Activity</span>
                </Link>
              </div>

              {selectedDayItems.length === 0 ? (
                <div className="empty-day-state">
                  <p className="text-xs text-slate-500 font-semibold">No activities planned for this day.</p>
                  <Link to={`/trips/${tripId}/builder`} className="btn-add-activity-panel mt-2 inline-flex">
                    <Plus size={14} />
                    <span>Schedule Activity</span>
                  </Link>
                </div>
              ) : (
                <div className="day-activities-list">
                  {selectedDayItems.map((item) => {
                    const { itineraryActivity, activity, cityName } = item;
                    const itemConflict = conflicts.find(
                      (c) => c.activityAId === itineraryActivity._id || c.activityBId === itineraryActivity._id
                    );

                    return (
                      <div
                        key={itineraryActivity._id}
                        className={`day-activity-item-card ${itemConflict ? 'conflict' : ''}`}
                      >
                        <div className="act-item-left">
                          <div className="time-badge">
                            <Clock size={12} />
                            <span>{itineraryActivity.startTime} – {itineraryActivity.endTime}</span>
                          </div>
                          <div>
                            <h4 className="act-name">{activity?.name}</h4>
                            <div className="act-meta">
                              <span>📍 {cityName}</span>
                              <span>⏱️ {activity?.durationMinutes || 60} mins</span>
                              <span className="cost-tag">₹{itineraryActivity.estimatedCost}</span>
                            </div>
                            {itemConflict && (
                              <p className="conflict-msg">
                                <AlertTriangle size={12} /> Overlap: {itemConflict.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="act-item-actions">
                          <button
                            type="button"
                            onClick={() => openQuickEdit(item)}
                            className="btn-act-action outline"
                          >
                            <Edit3 size={13} />
                            <span>Quick Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(itineraryActivity._id, activity?.name)}
                            className="btn-act-action delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: VERTICAL SEQUENTIAL TIMELINE */
        <div className="vertical-timeline-container">
          {Object.keys(dateMap).sort().map((dateKey, dayIdx) => {
            const dayItems = dateMap[dateKey];
            return (
              <div key={dateKey} className="timeline-day-block">
                <div className="timeline-day-header">
                  <span className="day-badge">Day {dayIdx + 1}</span>
                  <h3 className="timeline-day-title">{formatDate(dateKey)}</h3>
                  <span className="count-pill">{dayItems.length} activities</span>
                </div>

                <div className="timeline-items-stack">
                  {dayItems.map((item) => {
                    const { itineraryActivity, activity, cityName } = item;
                    return (
                      <div key={itineraryActivity._id} className="timeline-activity-card">
                        <div className="time-col">
                          {itineraryActivity.startTime} – {itineraryActivity.endTime}
                        </div>
                        <div className="info-col">
                          <h4 className="act-title">{activity?.name}</h4>
                          <span className="city-pill">📍 {cityName}</span>
                        </div>
                        <div className="cost-col font-bold text-slate-900">
                          ₹{itineraryActivity.estimatedCost}
                        </div>
                        <button
                          type="button"
                          onClick={() => openQuickEdit(item)}
                          className="btn-act-action outline text-xs"
                        >
                          Quick Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {isQuickEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>Quick Edit Schedule</span>
              </h3>
              <button onClick={() => setIsQuickEditOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Activity:</span>{' '}
                <strong className="text-slate-900">{editingActivity?.activity?.name}</strong>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
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
