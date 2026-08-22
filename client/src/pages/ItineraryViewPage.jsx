import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
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
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  ArrowDown,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import './ItineraryPages.css';

export default function ItineraryViewPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const openAIWithContext = outletCtx.openAIWithContext;

  const [loading, setLoading] = useState(true);
  const [itineraryData, setItineraryData] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedActivityForModal, setSelectedActivityForModal] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupBy, setGroupBy] = useState('DAY'); // 'DAY' or 'CITY'
  const [sortBy, setSortBy] = useState('TIME'); // 'TIME', 'COST_ASC', 'COST_DESC'

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
    return new Date(dateInput).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateInput) => {
    if (!dateInput) return '';
    return new Date(dateInput).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  const openAIChat = () => {
    if (openAIWithContext) {
      openAIWithContext({ page: 'itinerary', tripId });
    } else {
      const event = new CustomEvent('open-ai-agent', {
        detail: { message: 'Help me optimize and order this trip itinerary.', tripId },
      });
      window.dispatchEvent(event);
    }
  };

  const trip = itineraryData?.trip;
  const stops = itineraryData?.stops || [];
  
  // Aggregate all activities across stops
  const allScheduledItems = useMemo(() => {
    const items = [];
    stops.forEach((stopItem) => {
      const { city, activities, stop } = stopItem;
      activities.forEach((actItem) => {
        items.push({
          ...actItem,
          stop,
          city,
          cityName: city?.name || 'Destination',
          countryName: city?.country || '',
        });
      });
    });
    return items;
  }, [stops]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...allScheduledItems];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) => {
        const nameMatch = item.activity?.name?.toLowerCase().includes(q);
        const cityMatch = item.cityName?.toLowerCase().includes(q);
        const typeMatch = item.activity?.type?.toLowerCase().includes(q);
        return nameMatch || cityMatch || typeMatch;
      });
    }

    if (categoryFilter) {
      result = result.filter((item) => item.activity?.type === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'TIME') {
        const dateA = new Date(a.itineraryActivity.date).getTime();
        const dateB = new Date(b.itineraryActivity.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return (a.itineraryActivity.startTime || '').localeCompare(b.itineraryActivity.startTime || '');
      }
      if (sortBy === 'COST_ASC') {
        return (a.itineraryActivity.estimatedCost || 0) - (b.itineraryActivity.estimatedCost || 0);
      }
      if (sortBy === 'COST_DESC') {
        return (b.itineraryActivity.estimatedCost || 0) - (a.itineraryActivity.estimatedCost || 0);
      }
      return 0;
    });

    return result;
  }, [allScheduledItems, search, categoryFilter, sortBy]);

  // Group items by DateKey
  const dateMap = useMemo(() => {
    const map = {};
    filteredItems.forEach((item) => {
      const dateKey = new Date(item.itineraryActivity.date).toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });
    return map;
  }, [filteredItems]);

  const sortedDates = useMemo(() => Object.keys(dateMap).sort(), [dateMap]);

  // Calculate total trip cost
  const totalTripCost = useMemo(() => {
    return allScheduledItems.reduce((sum, item) => sum + (item.itineraryActivity.estimatedCost || item.activity?.cost || 0), 0);
  }, [allScheduledItems]);

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

  if (loading && !itineraryData) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold">
        <div className="gt-spinner-lg mx-auto mb-4"></div>
        <p className="text-sm">Loading Final Itinerary View...</p>
      </div>
    );
  }

  return (
    <div className="itinerary-page-container">
      {/* 4. PAGE HEADER & COMPACT SUMMARY */}
      <div className="itinerary-header-card">
        <div className="header-info-group">
          <Link to="/trips" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-1 font-semibold">
            <ArrowLeft size={14} />
            <span>My Trips</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="engine-badge">Final Itinerary View</span>
            {trip?.visibility === 'PUBLIC' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                🌐 Public Share
              </span>
            )}
          </div>
          <h1 className="header-title-text">{trip?.name || 'Trip Itinerary'}</h1>
          <p className="header-sub-text flex flex-wrap items-center gap-3 mt-1 font-medium">
            <span>📅 {formatDate(trip?.startDate)} — {formatDate(trip?.endDate)}</span>
            <span>📍 {stops.length} Cities</span>
            <span>🎯 {allScheduledItems.length} Activities</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">💰 ₹{totalTripCost.toLocaleString()} Estimated</span>
          </p>
        </div>

        {/* Header Actions */}
        <div className="header-actions-row">
          <button
            onClick={openAIChat}
            className="nav-action-btn secondary text-xs"
            title="Optimize schedule with AI"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Optimize AI</span>
          </button>

          <Link to={`/trips/${tripId}/budget`} className="nav-action-btn secondary text-xs">
            <DollarSign size={14} className="text-emerald-500" />
            <span>View Budget →</span>
          </Link>

          {/* 7. VIEW MODE TOGGLE */}
          <div className="gt-view-toggle-group">
            <button
              onClick={() => setViewMode('list')}
              className={`gt-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={14} />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`gt-view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>
          </div>

          <Link to={`/trips/${tripId}/builder`} className="nav-action-btn primary text-xs">
            <Edit3 size={14} />
            <span>Open Builder</span>
          </Link>
        </div>
      </div>

      {/* 8. SEARCH AND CONTROLS BAR */}
      <div className="my-trips-controls-bar">
        {/* Search */}
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search itinerary activities or cities..."
            className="search-input-field"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-controls-right">
          {/* Group By */}
          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="custom-select-element"
              title="Group By"
            >
              <option value="DAY">Group: Day-wise</option>
              <option value="CITY">Group: City-wise</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="custom-select-element"
              title="Category Filter"
            >
              <option value="">All Categories</option>
              <option value="Sightseeing">Sightseeing</option>
              <option value="Food">Food & Dining</option>
              <option value="Adventure">Adventure</option>
              <option value="Culture">Culture</option>
              <option value="Nature">Nature</option>
              <option value="Shopping">Shopping</option>
              <option value="Nightlife">Nightlife</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="select-control-box">
            <ArrowUpDown size={15} className="control-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select-element"
              title="Sort By"
            >
              <option value="TIME">Chronological (Time)</option>
              <option value="COST_ASC">Cost: Low to High</option>
              <option value="COST_DESC">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIST VIEW MODE (SCREEN 9 WIREFRAME LAYOUT) */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {/* 38. EMPTY ITINERARY STATE */}
          {allScheduledItems.length === 0 ? (
            <div className="itinerary-empty-card">
              <div className="itinerary-empty-icon">
                <Compass size={32} />
              </div>
              <h3 className="itinerary-empty-title">Your itinerary is still empty</h3>
              <p className="itinerary-empty-sub">
                Add destinations and activities in the Itinerary Builder to start visualizing your journey.
              </p>
              <div className="flex items-center gap-3">
                <Link to={`/trips/${tripId}/builder`} className="nav-action-btn primary">
                  <Edit3 size={15} />
                  <span>Build Itinerary</span>
                </Link>
                <button onClick={openAIChat} className="nav-action-btn secondary">
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Plan with AI</span>
                </button>
              </div>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="itinerary-empty-card">
              <h3 className="itinerary-empty-title">No activities match your filters</h3>
              <p className="itinerary-empty-sub">Try clearing your search query or category filter.</p>
              <button onClick={() => { setSearch(''); setCategoryFilter(''); }} className="nav-action-btn primary">
                Clear Filters
              </button>
            </div>
          ) : (
            sortedDates.map((dateKey, dateIdx) => {
              const dayItems = dateMap[dateKey];
              const dayTotalCost = dayItems.reduce(
                (sum, i) => sum + (i.itineraryActivity.estimatedCost || i.activity?.cost || 0),
                0
              );
              const currentCity = dayItems[0]?.cityName || 'Destination';

              return (
                <div key={dateKey} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-0">
                  {/* 13. DAY HEADER & 14. CITY HEADER */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm">
                        DAY {dateIdx + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{formatDate(dateKey)}</span>
                          <span className="text-xs text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-blue-100 dark:border-slate-700">
                            📍 {currentCity}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {dayItems.length} activity{dayItems.length === 1 ? '' : 'ies'} scheduled
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Day Total</p>
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{dayTotalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* 15. ACTIVITY TIMELINE & 16. ACTIVITY BLOCK & 19. EXPENSE COLUMN */}
                  <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                    {/* Header labels for Desktop */}
                    <div className="hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <span>PHYSICAL ACTIVITY</span>
                      <span>EXPENSE</span>
                    </div>

                    {dayItems.map((item, idx) => {
                      const { itineraryActivity, activity, cityName } = item;
                      const costVal = itineraryActivity.estimatedCost || activity?.cost || 0;

                      return (
                        <React.Fragment key={itineraryActivity._id}>
                          {/* Timeline sequence connector */}
                          {idx > 0 && (
                            <div className="timeline-flow-connector">
                              <div className="timeline-line" />
                              <div className="timeline-down-badge">
                                <ArrowDown size={10} />
                              </div>
                            </div>
                          )}

                          {/* 16. ACTIVITY CARD */}
                          <div
                            onClick={() => setSelectedActivityForModal(item)}
                            className="itinerary-activity-card"
                          >
                            <div className="flex items-start space-x-3 flex-1 min-width-0">
                              {/* Time Pill */}
                              <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-xs font-bold text-blue-700 dark:text-cyan-400 shrink-0">
                                {itineraryActivity.startTime} – {itineraryActivity.endTime}
                              </div>

                              {/* Thumbnail */}
                              {activity?.image && (
                                <img
                                  src={activity.image}
                                  alt={activity.name}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800 hidden xs:block"
                                />
                              )}

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {activity?.name}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 text-[10px] font-bold">
                                    {activity?.type}
                                  </span>
                                </div>
                                {activity?.description && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                                    {activity.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} /> {activity?.durationMinutes || 60} mins
                                  </span>
                                  <span>📍 {cityName}</span>
                                </div>
                              </div>
                            </div>

                            {/* 19. EXPENSE COLUMN */}
                            <div className="activity-expense-column">
                              <span className="expense-header-label hidden sm:block">Expense</span>
                              {costVal === 0 ? (
                                <span className="expense-amount-free">Free</span>
                              ) : (
                                <span className="expense-amount-val">₹{costVal.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* 22. DAILY COST FOOTER */}
                  <div className="day-cost-summary-bar">
                    <span>Day Total</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{dayTotalCost.toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}

          {/* 23. TRIP TOTAL & BUDGET LINK FOOTER */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Estimated Trip Cost Summary</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-0.5">₹{totalTripCost.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {allScheduledItems.length} activities scheduled across {stops.length} cities
              </p>
            </div>
            <Link to={`/trips/${tripId}/budget`} className="nav-action-btn primary text-xs shrink-0">
              <DollarSign size={15} />
              <span>View Full Budget & Expenses →</span>
            </Link>
          </div>
        </div>
      )}

      {/* 29. CALENDAR VIEW MODE */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
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
                    <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">Day {idx + 1}</span>
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
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 cursor-pointer text-xs space-y-1 transition-all"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                              <span className="truncate">{activity?.name}</span>
                              <span className="text-[10px] text-blue-600 dark:text-cyan-400 shrink-0 ml-1">{itineraryActivity.startTime}</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 text-[10px] font-bold uppercase">
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
                  <span className="font-semibold text-blue-600 dark:text-cyan-400">
                    {selectedActivityForModal.itineraryActivity.startTime} – {selectedActivityForModal.itineraryActivity.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedActivityForModal.activity?.durationMinutes || 60} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Cost:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedActivityForModal.itineraryActivity.estimatedCost || selectedActivityForModal.activity?.cost || 0}</span>
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
