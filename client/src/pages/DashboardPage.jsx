import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';
import CityDetailModal from '../components/CityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { 
  Plus, 
  Compass, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  ArrowUpDown,
  Bookmark,
  TrendingUp,
  Globe
} from 'lucide-react';
import '../App.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setIsCreateTripOpen, openAIWithContext } = useOutletContext() || {};

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingCities, setLoadingCities] = useState(true);

  // Search & Filter Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [groupBy, setGroupBy] = useState('NONE');
  const [sortBy, setSortBy] = useState('POPULARITY');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Modal states
  const [selectedCityForModal, setSelectedCityForModal] = useState(null);
  const [cityDetailModalOpen, setCityDetailModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [tripSelectModalOpen, setTripSelectModalOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
    fetchPopularCities();
  }, []);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await api.get('/trips?limit=6');
      if (res.data && res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
    setLoadingTrips(false);
  };

  const fetchPopularCities = async () => {
    setLoadingCities(true);
    try {
      const res = await api.get('/cities?sort=popularity&limit=8');
      if (res.data && res.data.success) {
        setPopularCities(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching popular cities:', err);
    }
    setLoadingCities(false);
  };

  const handleDeleteTrip = async (tripId, tripName) => {
    if (window.confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/trips/${tripId}`);
        if (res.data && res.data.success) {
          fetchTrips();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete trip.');
      }
    }
  };

  const handleOpenCityDetails = (city) => {
    setSelectedCityForModal(city);
    setCityDetailModalOpen(true);
  };

  const handleOpenTripSelect = (city) => {
    setItemToAdd(city);
    setTripSelectModalOpen(true);
  };

  // Filtered and sorted cities logic
  const filteredCities = useMemo(() => {
    let result = [...popularCities];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.country?.toLowerCase().includes(q) || c.region?.toLowerCase().includes(q)
      );
    }

    if (selectedRegion !== 'ALL') {
      result = result.filter((c) => c.region?.toUpperCase() === selectedRegion.toUpperCase());
    }

    if (sortBy === 'NAME') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'COST') {
      result.sort((a, b) => (a.costIndex || 0) - (b.costIndex || 0));
    } else {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return result;
  }, [popularCities, searchQuery, selectedRegion, sortBy]);

  const upcomingTrips = trips.filter((t) => t.status === 'UPCOMING' || t.status === 'ONGOING');
  const nextTripWithBudget = upcomingTrips.find((t) => t.budget?.amount > 0) || trips.find((t) => t.budget?.amount > 0);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* 1. WELCOME MESSAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Where are you heading next?
          </p>
        </div>

        {/* AI CTA Header Pill */}
        <button
          onClick={() => openAIWithContext && openAIWithContext({ page: 'dashboard' })}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>✨ Plan with GlobeTrotter AI</span>
        </button>
      </div>

      {/* 2. HERO / BANNER SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[300px] flex items-center">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.45] transition-all duration-700 hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Globe className="w-3.5 h-3.5" />
            <span>Travel Discovery</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Your next adventure starts here.
          </h2>

          <p className="text-sm text-slate-200 leading-relaxed max-w-lg">
            Discover places, build your itinerary, and let GlobeTrotter plan with you.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => openAIWithContext && openAIWithContext({ page: 'dashboard' })}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Plan with AI</span>
            </button>

            <button
              onClick={() => setIsCreateTripOpen ? setIsCreateTripOpen(true) : navigate('/trips/create')}
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs backdrop-blur-md border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Plan a trip</span>
            </button>
          </div>
        </div>

        {/* Compact Upcoming Trip / Budget Highlight Overlay Badge */}
        {nextTripWithBudget && (
          <div className="hidden lg:flex absolute right-8 bottom-8 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl max-w-xs shadow-xl items-center space-x-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Upcoming Trip Budget</p>
              <p className="text-base font-extrabold text-white mt-0.5">
                ₹{nextTripWithBudget.budget.amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-cyan-400 truncate max-w-[160px]">
                {nextTripWithBudget.name}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 3. SEARCH + GROUP BY + FILTER + SORT CONTROLS */}
      <section className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Dominant Search Input */}
          <div className="relative flex-1 width-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations, cities, or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Region Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ALL">Filter: All Regions</option>
                <option value="ASIA">Asia</option>
                <option value="EUROPE">Europe</option>
                <option value="AMERICAS">Americas</option>
                <option value="AFRICA">Africa</option>
                <option value="OCEANIA">Oceania</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="POPULARITY">Sort: Popularity</option>
                <option value="COST">Sort: Cost Index</option>
                <option value="NAME">Sort: Name</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. TOP REGIONAL SELECTIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <h2 className="text-lg font-bold text-slate-100 whitespace-nowrap">
              Top Regional Selections
            </h2>
            <div className="h-[1px] bg-slate-800 flex-1" />
          </div>

          <Link
            to="/cities"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 ml-4"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCities ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <Compass className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No destinations found</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
            {filteredCities.slice(0, 5).map((city) => (
              <CityCard
                key={city._id}
                city={city}
                onViewDetails={handleOpenCityDetails}
                onAdd={handleOpenTripSelect}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. PREVIOUS TRIPS SECTION */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <h2 className="text-lg font-bold text-slate-100 whitespace-nowrap">
              Previous Trips
            </h2>
            <div className="h-[1px] bg-slate-800 flex-1" />
          </div>

          {/* Prominent "+ Plan a trip" CTA */}
          <button
            onClick={() => setIsCreateTripOpen ? setIsCreateTripOpen(true) : navigate('/trips/create')}
            className="ml-4 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Plan a trip</span>
          </button>
        </div>

        {loadingTrips ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400 border border-slate-700">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">No trips yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Start planning your next adventure. Explore destinations or ask AI to construct an itinerary.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsCreateTripOpen ? setIsCreateTripOpen(true) : navigate('/trips/create')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Plan a trip</span>
              </button>

              <button
                onClick={() => openAIWithContext && openAIWithContext({ page: 'dashboard' })}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-1.5 border border-slate-700"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>✨ Plan with AI</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <CityDetailModal
        isOpen={cityDetailModalOpen}
        onClose={() => setCityDetailModalOpen(false)}
        cityId={selectedCityForModal?._id}
        onAddToTrip={handleOpenTripSelect}
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
