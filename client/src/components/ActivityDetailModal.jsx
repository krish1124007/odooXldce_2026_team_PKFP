import React from 'react';
import { X, Clock, DollarSign, Plus, Check, Trash2 } from 'lucide-react';

const ActivityDetailModal = ({ isOpen, onClose, activity, onAdd, onRemove, isAdded }) => {
  if (!isOpen || !activity) return null;

  const formatDuration = (mins) => {
    if (!mins) return 'Flexible';
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0 && m > 0) return `${hrs} hours ${m} mins`;
    if (hrs > 0) return `${hrs} hours`;
    return `${m} mins`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-56 w-full bg-slate-950">
          <img
            src={activity.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

          <div className="absolute bottom-4 left-5 right-5">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-2 inline-block">
              {activity.type}
            </span>
            <h3 className="text-2xl font-bold text-white leading-tight">{activity.name}</h3>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Cost</p>
                <p className="font-bold text-slate-200">
                  {activity.cost === 0 ? 'Free Activity' : `₹${activity.cost.toLocaleString()}`}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Duration</p>
                <p className="font-bold text-slate-200">{formatDuration(activity.durationMinutes)}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{activity.description}</p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {isAdded ? (
              <div className="flex items-center space-x-3">
                <div className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold text-sm flex items-center justify-center space-x-2 border border-emerald-500/30">
                  <Check className="w-4 h-4" />
                  <span>Added to Trip</span>
                </div>
                <button
                  onClick={() => {
                    if (onRemove) onRemove(activity);
                    onClose();
                  }}
                  className="px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-sm transition-colors border border-rose-500/20 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onAdd) onAdd(activity);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity to Trip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;
