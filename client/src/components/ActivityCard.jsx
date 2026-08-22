import React from 'react';
import { Clock, DollarSign, Plus, Check, Trash2, Eye } from 'lucide-react';

const ActivityCard = ({ activity, onAdd, onRemove, isAdded, onViewDetails }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'Food':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400';
      case 'Adventure':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400';
      case 'Culture':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400';
      case 'Nature':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Nightlife':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400';
      case 'Photography':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400';
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
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={activity.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm ${getTypeColor(activity.type)}`}>
            {activity.type}
          </span>
        </div>

        {activity.cityId?.name && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm border border-slate-700">
              {activity.cityId.name}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
            {activity.name}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{activity.cost === 0 ? 'Free' : `₹${activity.cost.toLocaleString()}`}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(activity.durationMinutes)}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={() => onViewDetails && onViewDetails(activity)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          </button>

          {isAdded ? (
            <div className="flex-1 flex items-center space-x-1">
              <span className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </span>
              <button
                onClick={() => onRemove && onRemove(activity)}
                className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400 transition-colors"
                title="Remove from trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd && onAdd(activity)}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center space-x-1.5"
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
