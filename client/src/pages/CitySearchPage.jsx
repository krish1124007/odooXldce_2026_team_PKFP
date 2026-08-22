import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CityCard from '../components/CityCard';
import CityDetailModal from '../components/CityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { Search, Filter, MapPin, Globe, ArrowLeft, ArrowUpDown } from 'lucide-react';
import './MyTripsPage.css';

export default function CitySearchPage() {
  const { tripId } = useParams();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [maxCost, setMaxCost] = useState('');

  const [activeTrip, setActiveTrip] = useState(null);

  const [selectedCityForModal, setSelectedCityForModal] = useState(null);
  const [cityDetailModalOpen, setCityDetailModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [tripSelectModalOpen, setTripSelectModalOpen] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchActiveTrip();
    }
  }, [tripId]);

  useEffect(() => {
    fetchCities();
  }, [region, country, sortBy, maxCost]);

  const fetchActiveTrip = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      if (res.data && res.data.success) {
        setActiveTrip(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch active trip:', err);
    }
  };

  const fetchCities = async () => {
    setLoading(true);
    try {
      let queryParams = [`sort=${sortBy}`, `limit=30`];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (region) queryParams.push(`region=${encodeURIComponent(region)}`);
      if (country) queryParams.push(`country=${encodeURIComponent(country)}`);
      if (maxCost) queryParams.push(`maxCost=${maxCost}`);

      const res = await api.get(`/cities?${queryParams.join('&')}`);
      if (res.data && res.data.success) {
        setCities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCities();
  };

  const handleAddCityToTrip = async (city) => {
    if (tripId) {
      try {
        const res = await api.post(`/trips/${tripId}/destinations/${city._id}`);
        if (res.data && res.data.success) {
          setActiveTrip(res.data.data);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to add city to trip.');
      }
    } else {
      setItemToAdd(city);
      setTripSelectModalOpen(true);
    }
  };

  const isCityInActiveTrip = (cityIdToCheck) => {
    if (!activeTrip || !activeTrip.destinations) return false;
    return activeTrip.destinations.some((d) => (typeof d === 'object' ? d._id : d) === cityIdToCheck);
  };

  return (
    <div className="my-trips-container">
      <div className="space-y-1">
        {tripId && (
          <Link to={`/trips/${tripId}/builder`} className="btn-form-cancel text-xs mb-2">
            <ArrowLeft size={14} />
            <span>Back to {activeTrip?.name || 'Trip Builder'}</span>
          </Link>
        )}

        <div className="my-trips-header-row">
          <div>
            <h1 className="page-main-title flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              <span>Explore Cities & Destinations</span>
            </h1>
            <p className="page-sub-title">
              {tripId
                ? `Select destinations to add to "${activeTrip?.name || 'your trip'}"`
                : 'Discover vibrant cities across Asia, Europe, Americas, Africa, and beyond'}
            </p>
          </div>
        </div>
      </div>

      {activeTrip && (
        <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider">Active Trip Context</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeTrip.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {activeTrip.destinations?.length || 0} cities currently added
              </p>
            </div>
          </div>
          <Link to={`/trips/${activeTrip._id}/builder`} className="btn-primary-action text-xs">
            Return to Builder →
          </Link>
        </div>
      )}

      {/* Toolbar */}
      <div className="my-trips-controls-bar">
        <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city by name, country or region..."
            className="search-input-field"
          />
        </form>

        <div className="filter-controls-right">
          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="custom-select-element"
            >
              <option value="">All Regions</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Middle East">Middle East</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="custom-select-element"
            >
              <option value="">Any Cost Index</option>
              <option value="45">Budget Friendly (&le; 45)</option>
              <option value="70">Moderate (&le; 70)</option>
              <option value="100">All Price Levels</option>
            </select>
          </div>

          <div className="select-control-box">
            <ArrowUpDown size={15} className="control-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select-element"
            >
              <option value="popularity">Highest Popularity</option>
              <option value="costAsc">Lowest Cost Index</option>
              <option value="costDesc">Highest Cost Index</option>
              <option value="name">City Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-state-box">
          <div className="gt-spinner-lg" />
          <p>Searching destinations...</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="empty-trips-card">
          <div className="empty-icon-circle">
            <MapPin size={32} />
          </div>
          <h3 className="empty-title-text">No cities found</h3>
          <p className="empty-desc-text">
            Try broadening your search query or clearing region filters.
          </p>
        </div>
      ) : (
        <div className="trips-grid">
          {cities.map((city) => (
            <CityCard
              key={city._id}
              city={city}
              isAddedInCurrentTrip={isCityInActiveTrip(city._id)}
              onAdd={handleAddCityToTrip}
              onViewDetails={(c) => {
                setSelectedCityForModal(c);
                setCityDetailModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CityDetailModal
        isOpen={cityDetailModalOpen}
        onClose={() => setCityDetailModalOpen(false)}
        cityId={selectedCityForModal?._id}
        onAddToTrip={handleAddCityToTrip}
      />

      <TripSelectModal
        isOpen={tripSelectModalOpen}
        onClose={() => setTripSelectModalOpen(false)}
        itemToAdd={itemToAdd}
        type="city"
      />
    </div>
  );
}
