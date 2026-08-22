import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { X, DollarSign, TrendingUp, Compass, ArrowRight, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CityDetailModal = ({ isOpen, onClose, cityId, onAddToTrip }) => {
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDestinationSaved, saveDestination, removeSavedDestination } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && cityId) {
      fetchCityDetail();
    }
  }, [isOpen, cityId]);

  const fetchCityDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cities/${cityId}`);
      if (res.data && res.data.success) {
        setCityData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch city details:', err);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const isSaved = (cityData && isDestinationSaved) ? isDestinationSaved(cityData._id) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !cityData ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading city overview...</div>
        ) : (
          <div>
            <div className="relative h-64 w-full bg-slate-950">
              <img
                src={cityData.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1200&q=80'}
                alt={cityData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-2 inline-block">
                    {cityData.country} • {cityData.region}
                  </span>
                  <h2 className="text-3xl font-extrabold text-white">{cityData.name}</h2>
                </div>

                <button
                  onClick={() => {
                    if (isSaved) {
                      if (removeSavedDestination) removeSavedDestination(cityData._id);
                    } else {
                      if (saveDestination) saveDestination(cityData._id);
                    }
                  }}
                  className={`p-3 rounded-2xl border backdrop-blur-md transition-all ${
                    isSaved
                      ? 'bg-amber-500/90 text-white border-amber-500/50 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save destination'}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Cost Index</p>
                    <p className="text-lg font-bold text-slate-100">{cityData.costIndex} / 100</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Popularity Score</p>
                    <p className="text-lg font-bold text-slate-100">{cityData.popularity} / 100</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">About {cityData.name}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{cityData.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Things to Do in {cityData.name}</span>
                  </h4>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/trips/demo-trip/activities?cityId=${cityData._id}`);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>View All Activities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {cityData.activities && cityData.activities.length > 0 ? (
                  <div className="space-y-2.5">
                    {cityData.activities.slice(0, 3).map((act) => (
                      <div
                        key={act._id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={act.image || cityData.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-200">{act.name}</p>
                            <p className="text-[10px] text-slate-400">{act.type} • {act.cost === 0 ? 'Free' : `₹${act.cost}`}</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                          {act.durationMinutes} mins
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No activities listed for this city yet.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center space-x-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onAddToTrip) onAddToTrip(cityData);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Add {cityData.name} to Trip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityDetailModal;
