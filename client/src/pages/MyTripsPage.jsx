import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import TripCard from '../components/TripCard';
import { Plus, Search, Filter, Compass, ArrowUpDown, Sparkles, Layers, RefreshCw, X, Calendar, MapPin } from 'lucide-react';
import './MyTripsPage.css';

export default function MyTripsPage() {
  const navigate = useNavigate();

  const [rawTrips, setRawTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBy, setGroupBy] = useState('STATUS'); // 'STATUS', 'NONE', 'DATE'
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST', 'OLDEST', 'START_DATE', 'NAME'

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips?limit=100');
      if (res.data && res.data.success) {
        setRawTrips(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user trips:', err);
    }
    setLoading(false);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const res = await api.delete(`/trips/${tripId}`);
      if (res.data && res.data.success) {
        setRawTrips((prev) => prev.filter((t) => t._id !== tripId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Determine trip status (ONGOING, UPCOMING, COMPLETED, DRAFT)
  const getTripCategory = (trip) => {
    if (trip.status === 'COMPLETED') return 'COMPLETED';
    if (trip.status === 'ONGOING') return 'ONGOING';
    if (trip.status === 'UPCOMING') return 'UPCOMING';
    if (trip.status === 'DRAFT') return 'DRAFT';

    const now = new Date();
    const start = trip.startDate ? new Date(trip.startDate) : null;
    const end = trip.endDate ? new Date(trip.endDate) : null;

    if (start && end) {
      if (now >= start && now <= end) return 'ONGOING';
      if (now < start) return 'UPCOMING';
      if (now > end) return 'COMPLETED';
    }
    return 'UPCOMING';
  };

  // Filter & Sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...rawTrips];

    // 1. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((t) => {
        const nameMatch = t.name?.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        const destMatch = t.destinations?.some((d) =>
          (typeof d === 'object' ? d.name : d)?.toLowerCase().includes(q)
        );
        return nameMatch || descMatch || destMatch;
      });
    }

    // 2. Status Filter
    if (statusFilter) {
      result = result.filter((t) => getTripCategory(t) === statusFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0);
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt || a.startDate || 0) - new Date(b.createdAt || b.startDate || 0);
      }
      if (sortBy === 'START_DATE') {
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      }
      if (sortBy === 'NAME') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return result;
  }, [rawTrips, search, statusFilter, sortBy]);

  // Categorized groups
  const ongoingTrips = useMemo(
    () => filteredAndSortedTrips.filter((t) => getTripCategory(t) === 'ONGOING'),
    [filteredAndSortedTrips]
  );
  const upcomingTrips = useMemo(
    () => filteredAndSortedTrips.filter((t) => getTripCategory(t) === 'UPCOMING' || getTripCategory(t) === 'DRAFT'),
    [filteredAndSortedTrips]
  );
  const completedTrips = useMemo(
    () => filteredAndSortedTrips.filter((t) => getTripCategory(t) === 'COMPLETED'),
    [filteredAndSortedTrips]
  );

  const openAIChat = () => {
    // Open GlobeTrotter AI Agent drawer
    const event = new CustomEvent('open-ai-agent', {
      detail: { message: 'Help me plan a personalized multi-city trip.' },
    });
    window.dispatchEvent(event);
  };

  const isFiltered = search || statusFilter;

  return (
    <div className="my-trips-container">
      {/* 3. PAGE HEADER */}
      <div className="my-trips-header-row">
        <div>
          <h1 className="page-main-title">My Trips</h1>
          <p className="page-sub-title">Manage your adventures, past and upcoming.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAIChat}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <span>Plan with AI</span>
          </button>
          <Link to="/trips/create" className="btn-primary-action">
            <Plus size={18} />
            <span>Plan a Trip</span>
          </Link>
        </div>
      </div>

      {/* 5. SEARCH AND CONTROLS BAR */}
      <div className="my-trips-controls-bar">
        {/* Search */}
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
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
            <Layers size={15} className="control-icon" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="custom-select-element"
              title="Group By"
            >
              <option value="STATUS">Group: By Status</option>
              <option value="NONE">Group: None (Grid View)</option>
            </select>
          </div>

          {/* Filter */}
          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="custom-select-element"
              title="Filter By Status"
            >
              <option value="">All Statuses</option>
              <option value="ONGOING">Ongoing</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
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
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="START_DATE">Start Date</option>
              <option value="NAME">Trip Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 39. LOADING STATE */}
      {loading ? (
        <div className="loading-state-box py-16">
          <div className="gt-spinner-lg" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2">
            Loading your trips...
          </p>
        </div>
      ) : rawTrips.length === 0 ? (
        /* 29. NO TRIPS AT ALL GLOBAL EMPTY STATE */
        <div className="empty-trips-card py-16">
          <div className="empty-icon-circle">
            <Compass size={36} />
          </div>
          <h3 className="empty-title-text">Your adventures start here.</h3>
          <p className="empty-desc-text">
            Create your first trip and start building an unforgettable itinerary.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Link to="/trips/create" className="btn-primary-action">
              <Plus size={18} />
              <span>Plan a Trip</span>
            </Link>
            <button
              onClick={openAIChat}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} className="text-amber-500" />
              <span>Plan with AI</span>
            </button>
          </div>
        </div>
      ) : filteredAndSortedTrips.length === 0 && isFiltered ? (
        /* 47 & 48. SEARCH / FILTER EMPTY RESULT */
        <div className="empty-trips-card py-16">
          <div className="empty-icon-circle">
            <Search size={32} />
          </div>
          <h3 className="empty-title-text">
            {search ? 'No trips found' : 'No trips match your filters'}
          </h3>
          <p className="empty-desc-text">
            {search
              ? 'Try another search term or adjust your filters.'
              : 'Try clearing your status filter to see all adventures.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="btn-primary-action"
          >
            <RefreshCw size={16} />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : groupBy === 'NONE' || statusFilter !== '' ? (
        /* FLAT GRID VIEW (WHEN STATUS FILTER IS ACTIVE OR GROUP BY IS NONE) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing {filteredAndSortedTrips.length} trip(s)</span>
          </div>
          <div className="trips-grid">
            {filteredAndSortedTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
            ))}
          </div>
        </div>
      ) : (
        /* 10. THREE STATUS SECTIONS (ONGOING, UPCOMING, COMPLETED) */
        <div className="space-y-8">
          {/* 11. ONGOING SECTION */}
          <div>
            <div className="trip-section-header-box">
              <div className="trip-section-title-wrap">
                <span className="trip-section-dot ongoing" />
                <h2 className="trip-section-title-text">Ongoing</h2>
                <span className="trip-section-count-badge">{ongoingTrips.length}</span>
              </div>
            </div>

            {ongoingTrips.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No ongoing trips</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your active adventures will appear here.
                </p>
              </div>
            ) : (
              <div className="trips-grid">
                {ongoingTrips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
                ))}
              </div>
            )}
          </div>

          {/* 12. UPCOMING SECTION */}
          <div>
            <div className="trip-section-header-box">
              <div className="trip-section-title-wrap">
                <span className="trip-section-dot upcoming" />
                <h2 className="trip-section-title-text">Upcoming</h2>
                <span className="trip-section-count-badge">{upcomingTrips.length}</span>
              </div>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No upcoming trips</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ready for your next adventure?
                  </p>
                </div>
                <Link to="/trips/create" className="btn-primary-action text-xs py-1.5 px-3">
                  <Plus size={14} />
                  <span>Plan a Trip</span>
                </Link>
              </div>
            ) : (
              <div className="trips-grid">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
                ))}
              </div>
            )}
          </div>

          {/* 13. COMPLETED SECTION */}
          <div>
            <div className="trip-section-header-box">
              <div className="trip-section-title-wrap">
                <span className="trip-section-dot completed" />
                <h2 className="trip-section-title-text">Completed</h2>
                <span className="trip-section-count-badge">{completedTrips.length}</span>
              </div>
            </div>

            {completedTrips.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No completed trips yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your past adventures will appear here.
                </p>
              </div>
            ) : (
              <div className="trips-grid opacity-95">
                {completedTrips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
