import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';
import CityDetailModal from '../components/CityDetailModal';
import TripSelectModal from '../components/TripSelectModal';
import { Plus, Compass, MapPin, Calendar, DollarSign, ArrowRight, Sparkles, TrendingUp, Bookmark, Bot } from 'lucide-react';
import '../App.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setIsCreateTripOpen, openAIWithContext } = useOutletContext() || {};

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingCities, setLoadingCities] = useState(true);

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
      const res = await api.get('/cities?sort=popularity&limit=4');
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

  const upcomingTrips = trips.filter((t) => t.status === 'UPCOMING' || t.status === 'ONGOING');
  const nextTripWithBudget = upcomingTrips.find((t) => t.budget?.amount > 0) || trips.find((t) => t.budget?.amount > 0);

  return (
    <div className="space-y-10 py-4">
      {/* Welcome Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 md:p-10 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic AI Travel Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.firstName || 'Traveler'}! ✈️
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Plan multi-city journeys, discover authentic local activities, manage budgets, and construct perfect travel itineraries with tool-using Groq AI.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => openAIWithContext && openAIWithContext({ page: 'dashboard' })}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>✨ Plan with GlobeTrotter AI</span>
            </button>

            <Link
              to="/trips/create"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </Link>

            <Link
              to="/cities"
              className="px-5 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center space-x-2 border border-slate-800"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Explore Cities</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Trip Budget</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {nextTripWithBudget?.budget?.amount
                ? `₹${nextTripWithBudget.budget.amount.toLocaleString()}`
                : 'Budget not set'}
            </p>
            {nextTripWithBudget && (
              <p className="text-[11px] text-cyan-400 font-medium mt-1 truncate">
                {nextTripWithBudget.name}
              </p>
            )}
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Total Trips</p>
            <p className="text-2xl font-extrabold text-white mt-1">{trips.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {upcomingTrips.length} upcoming/ongoing
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Destinations</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {user?.savedDestinations?.length || 0}
            </p>
            <Link to="/profile" className="text-[11px] text-cyan-400 font-medium hover:underline mt-1 block">
              Manage in Profile →
            </Link>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Trips Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">My Trips</h2>
            <p className="text-xs text-slate-400">Your upcoming and active travel plans</p>
          </div>

          <Link
            to="/trips"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingTrips ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading your trips...</div>
        ) : trips.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No trips yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't created any travel itineraries yet. Start planning your first getaway!
            </p>
            <Link
              to="/trips/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Your First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Cities */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Popular Destinations</span>
            </h2>
            <p className="text-xs text-slate-400">Top rated destinations across the world</p>
          </div>

          <Link
            to="/cities"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Explore All Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCities ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading popular cities...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCities.map((city) => (
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
