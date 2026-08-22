import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { X, Plus, Check } from 'lucide-react';

const TripSelectModal = ({ isOpen, onClose, itemToAdd, type = 'city' }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToId, setAddingToId] = useState(null);
  const [successTripId, setSuccessTripId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchUserTrips();
    }
  }, [isOpen]);

  const fetchUserTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      if (res.data && res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    }
    setLoading(false);
  };

  const handleSelectTrip = async (tripId) => {
    if (!itemToAdd) return;
    setAddingToId(tripId);

    try {
      let res;
      if (type === 'city') {
        res = await api.post(`/trips/${tripId}/destinations/${itemToAdd._id}`);
      } else {
        res = await api.post(`/trips/${tripId}/activities/${itemToAdd._id}`);
      }

      if (res.data && res.data.success) {
        setSuccessTripId(tripId);
        setTimeout(() => {
          setSuccessTripId(null);
          setAddingToId(null);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Add item to trip error:', err);
      setAddingToId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-100">
              Add {itemToAdd?.name} to Trip
            </h3>
            <p className="text-xs text-slate-400">Select an existing itinerary or start a new one.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading your trips...</div>
          ) : trips.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm space-y-2">
              <p>You don't have any active trips yet.</p>
            </div>
          ) : (
            trips.map((trip) => {
              const isDone = successTripId === trip._id;
              const isAdding = addingToId === trip._id;

              return (
                <button
                  key={trip._id}
                  onClick={() => handleSelectTrip(trip._id)}
                  disabled={isAdding || isDone}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                      <img
                        src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {trip.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </span>
                    ) : isAdding ? (
                      <span className="text-xs text-cyan-400 font-semibold animate-pulse">Adding...</span>
                    ) : (
                      <span className="text-xs text-slate-400 group-hover:text-cyan-400 font-semibold">Select →</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              navigate('/trips/create');
            }}
            className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create a New Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripSelectModal;
