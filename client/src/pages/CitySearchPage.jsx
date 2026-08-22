import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CityCard from '../components/CityCard';
import CityDetailModal from '../components/CityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { Search, Filter, MapPin, Globe, ArrowLeft } from 'lucide-react';

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
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        {tripId && (
          <Link
            to={`/trips/${tripId}/builder`}
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {activeTrip?.name || 'Trip Builder'}</span>
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-7 h-7 text-cyan-400" />
              <span>Explore Cities & Destinations</span>
            </h1>
            <p className="text-xs text-slate-400">
              {tripId
                ? `Select destinations to add to "${activeTrip?.name || 'your trip'}"`
                : 'Discover vibrant cities across Asia, Europe, Americas, Africa, and beyond'}
            </p>
          </div>
        </div>
      </div>

      {activeTrip && (
        <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Active Trip Context</p>
              <p className="text-sm font-bold text-slate-100">{activeTrip.name}</p>
              <p className="text-[11px] text-slate-400">
                {activeTrip.destinations?.length || 0} cities currently added
              </p>
            </div>
          </div>
          <Link
            to={`/trips/${activeTrip._id}/builder`}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white text-xs font-semibold transition-all"
          >
            Return to Builder →
          </Link>
        </div>
      )}

      {/* Toolbar */}
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
              placeholder="Search city by name, country or region..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all shrink-0"
          >
            Search Cities
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
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

          <select
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Any Cost Index</option>
            <option value="45">Budget Friendly (&le; 45)</option>
            <option value="70">Moderate (&le; 70)</option>
            <option value="100">All Price Levels</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 ml-auto"
          >
            <option value="popularity">Highest Popularity</option>
            <option value="costAsc">Lowest Cost Index</option>
            <option value="costDesc">Highest Cost Index</option>
            <option value="name">City Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Searching destinations...</div>
      ) : cities.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <MapPin className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No cities found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try broadening your search query or clearing region filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
