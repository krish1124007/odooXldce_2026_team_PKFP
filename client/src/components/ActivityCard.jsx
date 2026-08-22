import React from 'react';
import { Clock, DollarSign, Plus, Check, Trash2, Eye } from 'lucide-react';

const ActivityCard = ({ activity, onAdd, onRemove, isAdded, onViewDetails }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'Food':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Adventure':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Culture':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Nature':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Nightlife':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Photography':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const formatDuration = (mins) => {
    if (!mins) return 'Flex';
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0 && m > 0) return `${hrs}h ${m}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${m}m`;
  };

  return (
    <div className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={activity.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border backdrop-blur-md ${getTypeColor(activity.type)}`}>
            {activity.type}
          </span>
        </div>

        {activity.cityId?.name && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
              {activity.cityId.name}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-base font-bold text-slate-100 line-clamp-1 mb-1 group-hover:text-cyan-400 transition-colors">
            {activity.name}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center space-x-1 font-bold text-emerald-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{activity.cost === 0 ? 'Free' : `₹${activity.cost.toLocaleString()}`}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDuration(activity.durationMinutes)}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={() => onViewDetails && onViewDetails(activity)}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
          </button>

          {isAdded ? (
            <div className="flex-1 flex items-center space-x-1">
              <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </span>
              <button
                onClick={() => onRemove && onRemove(activity)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                title="Remove from trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd && onAdd(activity)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
