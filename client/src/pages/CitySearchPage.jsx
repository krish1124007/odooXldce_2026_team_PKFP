import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CityCard from '../components/CityCard';
import CityDetailModal from '../components/CityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { 
  Search, 
  Filter, 
  MapPin, 
  Globe, 
  ArrowLeft, 
  ArrowUpDown, 
  Sparkles, 
  Layers, 
  List, 
  Grid, 
  Eye, 
  Plus, 
  Check, 
  Bookmark, 
  DollarSign, 
  TrendingUp, 
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CitySearchPage.css';

export default function CitySearchPage() {
  const { tripId } = useParams();
  const { isDestinationSaved, saveDestination, removeSavedDestination } = useAuth();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'region', 'country'
  const [sortBy, setSortBy] = useState('popularity');
  const [maxCost, setMaxCost] = useState('');
  const [viewMode, setViewMode] = useState('list'); // Screen 8 defaults to list view

  const [activeTrip, setActiveTrip] = useState(null);

  // Modals
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
      let queryParams = [`sort=${sortBy}`, `limit=50`];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (region) queryParams.push(`region=${encodeURIComponent(region)}`);
      if (country) queryParams.push(`country=${encodeURIComponent(country)}`);
      if (maxCost) queryParams.push(`maxCost=${maxCost}`);

      const res = await api.get(`/cities?${queryParams.join('&')}`);
      if (res.data && res.data.success) {
        setCities(res.data.data || []);
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

  const handleClearFilters = () => {
    setSearch('');
    setRegion('');
    setCountry('');
    setMaxCost('');
    setSortBy('popularity');
    setGroupBy('none');
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

  const formatTripName = (name) => {
    if (!name) return 'Trip';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Group cities if Group By is selected
  const getGroupedCities = () => {
    if (groupBy === 'none') return { 'All Destinations': cities };

    const groups = {};
    cities.forEach((city) => {
      let key = 'Other';
      if (groupBy === 'region') key = city.region || 'Unspecified Region';
      if (groupBy === 'country') key = city.country || 'Unspecified Country';

      if (!groups[key]) groups[key] = [];
      groups[key].push(city);
    });
    return groups;
  };

  const groupedCities = getGroupedCities();

  return (
    <div className="city-search-screen-wrapper">
      {/* Top Header */}
      <div className="city-search-header-card">
        {tripId && (
          <Link to={`/trips/${tripId}/builder`} className="back-link-btn mb-1">
            <ArrowLeft size={14} />
            <span>Back to {formatTripName(activeTrip?.name)}</span>
          </Link>
        )}

        <div className="header-title-block">
          <h1 className="screen-title flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span>Explore Cities</span>
          </h1>
          <p className="screen-subtitle">
            {tripId && activeTrip
              ? `Adding destination to: ${formatTripName(activeTrip.name)}`
              : 'Find the perfect destinations for your next adventure.'}
          </p>
        </div>
      </div>

      {/* Active Trip Context Banner */}
      {activeTrip && (
        <div className="active-trip-context-banner">
          <div className="context-banner-left">
            <div className="context-icon-badge">
              <MapPin size={18} />
            </div>
            <div>
              <span className="context-label font-bold text-blue-600">Active Trip Context</span>
              <h3 className="context-trip-name">{formatTripName(activeTrip.name)}</h3>
              <p className="context-sub text-xs text-slate-500">
                {activeTrip.destinations?.length || 0} destinations added so far
              </p>
            </div>
          </div>
          <Link to={`/trips/${activeTrip._id}/builder`} className="btn-return-builder">
            Return to Builder →
          </Link>
        </div>
      )}

      {/* AI Discovery CTA Banner */}
      <div className="ai-discovery-banner">
        <div className="ai-banner-left">
          <div className="ai-sparkle-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="ai-banner-title">✨ Find a destination with AI</h4>
            <p className="ai-banner-desc">Ask GlobeTrotter AI to recommend affordable, vibrant destinations tailored to your interests.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert('✨ AI Destination Assistant will analyze global cities based on your travel prompt in Phase 6.')}
          className="btn-ai-banner"
        >
          Discover with AI
        </button>
      </div>

      {/* Toolbar & Controls Bar (Screen 8 Wireframe Layout) */}
      <div className="city-controls-toolbar">
        {/* Dominant Search Input */}
        <form onSubmit={handleSearchSubmit} className="city-search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cities, countries, or regions..."
            className="search-input"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); fetchCities(); }} className="search-clear-btn">
              <X size={14} />
            </button>
          )}
        </form>

        {/* Filter / Sort / Group Controls Row */}
        <div className="controls-right-group">
          {/* Group By */}
          <div className="control-select-wrapper">
            <Layers size={14} className="control-icon" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="control-select"
            >
              <option value="none">Group By: None</option>
              <option value="region">Group By: Region</option>
              <option value="country">Group By: Country</option>
            </select>
          </div>

          {/* Filter Region */}
          <div className="control-select-wrapper">
            <Filter size={14} className="control-icon" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="control-select"
            >
              <option value="">Filter Region: All</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Middle East">Middle East</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          {/* Filter Cost */}
          <div className="control-select-wrapper">
            <DollarSign size={14} className="control-icon" />
            <select
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="control-select"
            >
              <option value="">Cost Index: Any</option>
              <option value="45">Budget Friendly (&le; 45)</option>
              <option value="70">Moderate (&le; 70)</option>
              <option value="100">All Levels</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="control-select-wrapper">
            <ArrowUpDown size={14} className="control-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="popularity">Sort: Highest Popularity</option>
              <option value="costAsc">Sort: Cost (Low to High)</option>
              <option value="costDesc">Sort: Cost (High to Low)</option>
              <option value="name">Sort: City Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle Switch */}
          <div className="view-mode-toggle-group">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Vertical List View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header & Counter */}
      <div className="results-counter-bar">
        <h2 className="results-count-title">
          Results <span className="count-tag font-bold">({cities.length} cities found)</span>
        </h2>

        {(search || region || country || maxCost || groupBy !== 'none') && (
          <button onClick={handleClearFilters} className="btn-clear-filters text-xs text-blue-600 font-semibold hover:underline">
            Clear all filters & search
          </button>
        )}
      </div>

      {/* City Results Container */}
      {loading ? (
        <div className="loading-state-box">
          <div className="gt-spinner-lg" />
          <p className="text-xs font-semibold text-slate-600">Searching global destinations...</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="empty-results-card">
          <MapPin size={36} className="empty-icon text-slate-400" />
          <h3 className="empty-title text-slate-900 font-bold">No cities found</h3>
          <p className="empty-desc text-xs text-slate-500">
            Try another city, country, or region keyword.
          </p>
          <button onClick={handleClearFilters} className="btn-clear-search mt-3">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="city-results-stack">
          {Object.entries(groupedCities).map(([groupName, groupCitiesList]) => (
            <div key={groupName} className="city-group-block">
              {groupBy !== 'none' && (
                <div className="group-header-label">
                  <h3 className="group-title-text">{groupName}</h3>
                  <span className="group-count-pill">{groupCitiesList.length} destinations</span>
                </div>
              )}

              {/* LIST VIEW (Screen 8 Wireframe Vertical List Format) */}
              {viewMode === 'list' ? (
                <div className="city-vertical-list">
                  {groupCitiesList.map((city) => {
                    const isAdded = isCityInActiveTrip(city._id);
                    const isSaved = isDestinationSaved ? isDestinationSaved(city._id) : false;

                    return (
                      <div key={city._id} className="city-list-card">
                        {/* City Media Thumbnail */}
                        <div className="city-list-media">
                          <img
                            src={city.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80'}
                            alt={city.name}
                            className="list-card-img"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSaved) {
                                if (removeSavedDestination) removeSavedDestination(city._id);
                              } else {
                                if (saveDestination) saveDestination(city._id);
                              }
                            }}
                            className={`city-bookmark-overlay-btn ${isSaved ? 'saved' : ''}`}
                            title={isSaved ? 'Remove from saved' : 'Save destination'}
                          >
                            <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                          </button>
                        </div>

                        {/* City Info Details */}
                        <div className="city-list-details">
                          <div className="city-title-row">
                            <h3 className="city-list-name">{city.name}</h3>
                            <span className="city-list-country">{city.country} • {city.region}</span>
                          </div>

                          {city.description && (
                            <p className="city-list-desc line-clamp-2">
                              {city.description}
                            </p>
                          )}

                          {/* Cost Index & Popularity Metrics */}
                          <div className="city-metrics-row">
                            <div className="metric-pill">
                              <DollarSign size={13} className="metric-icon cost" />
                              <span>Cost Index: <strong>{city.costIndex} / 100</strong></span>
                            </div>

                            <div className="metric-pill">
                              <TrendingUp size={13} className="metric-icon pop" />
                              <span>Popularity: <strong>{city.popularity} / 100</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* List Actions */}
                        <div className="city-list-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCityForModal(city);
                              setCityDetailModalOpen(true);
                            }}
                            className="btn-list-action outline"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddCityToTrip(city)}
                            disabled={isAdded}
                            className={`btn-list-action ${isAdded ? 'added' : 'primary'}`}
                          >
                            {isAdded ? (
                              <>
                                <Check size={14} />
                                <span>Already in Trip</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                <span>+ Add to Trip</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* GRID VIEW */
                <div className="trips-grid">
                  {groupCitiesList.map((city) => (
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
            </div>
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
