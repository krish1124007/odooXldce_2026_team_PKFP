import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ActivityDetailModal from '../components/ActivityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { Search, Filter, Compass, ArrowLeft } from 'lucide-react';

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams();
  const { tripId } = useParams();

  const cityIdFromQuery = searchParams.get('cityId');

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  const [selectedActivityForModal, setSelectedActivityForModal] = useState(null);
  const [activityDetailModalOpen, setActivityDetailModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [tripSelectModalOpen, setTripSelectModalOpen] = useState(false);

  useEffect(() => {
    if (cityIdFromQuery) {
      fetchCityInfo(cityIdFromQuery);
    }
    if (tripId) {
      fetchTripInfo(tripId);
    }
  }, [cityIdFromQuery, tripId]);

  useEffect(() => {
    fetchActivities();
  }, [cityIdFromQuery, typeFilter, maxCost, maxDuration, sortBy]);

  const fetchCityInfo = async (cId) => {
    try {
      const res = await api.get(`/cities/${cId}`);
      if (res.data && res.data.success) {
        setActiveCity(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch city info:', err);
    }
  };

  const fetchTripInfo = async (tId) => {
    try {
      const res = await api.get(`/trips/${tId}`);
      if (res.data && res.data.success) {
        setActiveTrip(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trip info:', err);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let queryParams = [`sort=${sortBy}`, `limit=30`];
      if (cityIdFromQuery) queryParams.push(`cityId=${cityIdFromQuery}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (typeFilter) queryParams.push(`type=${encodeURIComponent(typeFilter)}`);
      if (maxCost) queryParams.push(`maxCost=${maxCost}`);
      if (maxDuration) queryParams.push(`maxDuration=${maxDuration}`);

      const res = await api.get(`/activities?${queryParams.join('&')}`);
      if (res.data && res.data.success) {
        setActivities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleAddActivity = async (activity) => {
    if (tripId || activeTrip) {
      const tId = tripId || activeTrip._id;
      try {
        const res = await api.post(`/trips/${tId}/activities/${activity._id}`);
        if (res.data && res.data.success) {
          setActiveTrip(res.data.data);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to add activity to trip.');
      }
    } else {
      setItemToAdd(activity);
      setTripSelectModalOpen(true);
    }
  };

  const handleRemoveActivity = async (activity) => {
    const tId = tripId || activeTrip?._id;
    if (!tId) return;

    try {
      const res = await api.delete(`/trips/${tId}/activities/${activity._id}`);
      if (res.data && res.data.success) {
        setActiveTrip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove activity.');
    }
  };

  const isActivityAdded = (activityId) => {
    if (!activeTrip || !activeTrip.activities) return false;
    return activeTrip.activities.some((a) => (typeof a === 'object' ? a._id : a) === activityId);
  };

  const activityTypes = [
    'Sightseeing',
    'Food',
    'Adventure',
    'Culture',
    'Nature',
    'Shopping',
    'Nightlife',
    'Photography',
  ];

  return (
    <div className="space-y-8 py-4">
      {tripId && (
        <Link
          to={`/trips/${tripId}/builder`}
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 font-semibold mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {activeTrip?.name || 'Trip Builder'}</span>
        </Link>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-7 h-7 text-cyan-400" />
          <span>
            {activeCity ? `Activities in ${activeCity.name}` : 'Discover Travel Activities'}
          </span>
        </h1>
        <p className="text-xs text-slate-400">
          {activeCity
            ? `Explore guided tours, culinary tasting, nature hikes, and landmarks in ${activeCity.name}, ${activeCity.country}`
            : 'Browse top rated sightseeing, food tours, outdoor adventures, and cultural experiences'}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            typeFilter === ''
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>
        {activityTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              typeFilter === t
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities by keyword (e.g. Temple, Tasting, Tour, Museum)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-md shadow-cyan-500/20 shrink-0"
          >
            Filter Activities
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          <select
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Any Cost</option>
            <option value="0">Free Only</option>
            <option value="1000">Under ₹1,000</option>
            <option value="2000">Under ₹2,000</option>
            <option value="3000">Under ₹3,000</option>
          </select>

          <select
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Any Duration</option>
            <option value="60">Under 1 Hour (&le; 60 mins)</option>
            <option value="120">Under 2 Hours (&le; 120 mins)</option>
            <option value="180">Under 3 Hours (&le; 180 mins)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 ml-auto"
          >
            <option value="popularity">Most Popular</option>
            <option value="costAsc">Lowest Price First</option>
            <option value="costDesc">Highest Price First</option>
            <option value="durationAsc">Shortest Duration</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No activities found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your category tabs or price filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <ActivityCard
              key={act._id}
              activity={act}
              isAdded={isActivityAdded(act._id)}
              onAdd={handleAddActivity}
              onRemove={handleRemoveActivity}
              onViewDetails={(a) => {
                setSelectedActivityForModal(a);
                setActivityDetailModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ActivityDetailModal
        isOpen={activityDetailModalOpen}
        onClose={() => setActivityDetailModalOpen(false)}
        activity={selectedActivityForModal}
        isAdded={selectedActivityForModal ? isActivityAdded(selectedActivityForModal._id) : false}
        onAdd={handleAddActivity}
        onRemove={handleRemoveActivity}
      />

      <TripSelectModal
        isOpen={tripSelectModalOpen}
        onClose={() => setTripSelectModalOpen(false)}
        itemToAdd={itemToAdd}
        type="activity"
      />
    </div>
  );
}
