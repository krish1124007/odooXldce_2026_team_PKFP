import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Calendar, Compass, DollarSign, Plus, ArrowLeft, Trash2 } from 'lucide-react';

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/trips/${tripId}`);
      if (res.data && res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trip:', err);
    }
    setLoading(false);
  };

  const handleRemoveDestination = async (cityId) => {
    try {
      const res = await api.delete(`/trips/${tripId}/destinations/${cityId}`);
      if (res.data && res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove destination');
    }
  };

  const handleRemoveActivity = async (activityId) => {
    try {
      const res = await api.delete(`/trips/${tripId}/activities/${activityId}`);
      if (res.data && res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove activity');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      <Link
        to="/trips"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Trips</span>
      </Link>

      {loading || !trip ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading trip details...</div>
      ) : (
        <div className="space-y-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <img
              src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

            <div className="relative z-10 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {trip.status} • {trip.visibility}
              </span>
              <h1 className="text-3xl font-extrabold text-white">{trip.name}</h1>
              <p className="text-xs text-slate-300 max-w-xl">{trip.description || 'No description provided.'}</p>

              <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>
                    {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Budget: ₹{trip.budget?.amount?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>Trip Destinations ({trip.destinations?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-400">Cities associated with this trip</p>
              </div>

              <Link
                to={`/trips/${trip._id}/cities`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cities</span>
              </Link>
            </div>

            {!trip.destinations || trip.destinations.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                No cities added to this trip yet. Click "Add Cities" above to select destinations!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trip.destinations.map((city) => (
                  <div
                    key={city._id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={city.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-200">{city.name}</p>
                        <p className="text-xs text-slate-400">{city.country}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/trips/${trip._id}/activities?cityId=${city._id}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        title="View City Activities"
                      >
                        <Plus className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleRemoveDestination(city._id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Remove from trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <span>Selected Activities ({trip.activities?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-400">Activities chosen for this trip</p>
              </div>

              <Link
                to={`/trips/${trip._id}/activities`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Explore & Add Activities</span>
              </Link>
            </div>

            {!trip.activities || trip.activities.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                No activities added yet. Browse activities to start building your wishlist!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trip.activities.map((act) => (
                  <div
                    key={act._id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={act.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-200 line-clamp-1">{act.name}</p>
                        <p className="text-xs text-slate-400">
                          {act.type} • {act.cost === 0 ? 'Free' : `₹${act.cost}`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveActivity(act._id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-900/50 text-center space-y-2">
            <p className="text-sm font-bold text-cyan-400">✨ Itinerary Builder Preview</p>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Day-by-day timeline scheduling, drag-and-drop stop reordering, calendar views, and smart itinerary optimization will be activated in Phase 4!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
