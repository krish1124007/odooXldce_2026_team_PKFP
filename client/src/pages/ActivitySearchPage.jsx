import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ActivityDetailModal from '../components/ActivityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { Search, Filter, Compass, ArrowLeft, ArrowUpDown } from 'lucide-react';
import './MyTripsPage.css';

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
    <div className="my-trips-container">
      {tripId && (
        <Link to={`/trips/${tripId}/builder`} className="btn-form-cancel text-xs mb-2">
          <ArrowLeft size={14} />
          <span>Back to {activeTrip?.name || 'Trip Builder'}</span>
        </Link>
      )}

      <div>
        <h1 className="page-main-title flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
          <span>
            {activeCity ? `Activities in ${activeCity.name}` : 'Discover Travel Activities'}
          </span>
        </h1>
        <p className="page-sub-title">
          {activeCity
            ? `Explore guided tours, culinary tasting, nature hikes, and landmarks in ${activeCity.name}, ${activeCity.country}`
            : 'Browse top rated sightseeing, food tours, outdoor adventures, and cultural experiences'}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            typeFilter === ''
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {activityTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              typeFilter === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="my-trips-controls-bar">
        <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities by keyword (e.g. Temple, Tasting, Tour, Museum)..."
            className="search-input-field"
          />
        </form>

        <div className="filter-controls-right">
          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="custom-select-element"
            >
              <option value="">Any Cost</option>
              <option value="0">Free Only</option>
              <option value="1000">Under ₹1,000</option>
              <option value="2000">Under ₹2,000</option>
              <option value="3000">Under ₹3,000</option>
            </select>
          </div>

          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={maxDuration}
              onChange={(e) => setMaxDuration(e.target.value)}
              className="custom-select-element"
            >
              <option value="">Any Duration</option>
              <option value="60">Under 1 Hour (&le; 60 mins)</option>
              <option value="120">Under 2 Hours (&le; 120 mins)</option>
              <option value="180">Under 3 Hours (&le; 180 mins)</option>
            </select>
          </div>

          <div className="select-control-box">
            <ArrowUpDown size={15} className="control-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select-element"
            >
              <option value="popularity">Most Popular</option>
              <option value="costAsc">Lowest Price First</option>
              <option value="costDesc">Highest Price First</option>
              <option value="durationAsc">Shortest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-state-box">
          <div className="gt-spinner-lg" />
          <p>Loading activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-trips-card">
          <div className="empty-icon-circle">
            <Compass size={32} />
          </div>
          <h3 className="empty-title-text">No activities found</h3>
          <p className="empty-desc-text">
            Try adjusting your category tabs or price filters.
          </p>
        </div>
      ) : (
        <div className="trips-grid">
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
