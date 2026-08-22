import React from 'react';
import { MapPin, Bookmark, Plus, Check, Eye, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CityCard = ({ city, onSelect, onAdd, isAddedInCurrentTrip, onViewDetails }) => {
  const { isDestinationSaved, saveDestination, removeSavedDestination } = useAuth();
  const isSaved = isDestinationSaved ? isDestinationSaved(city._id) : false;

  const handleToggleSave = (e) => {
    e.stopPropagation();
    if (isSaved) {
      if (removeSavedDestination) removeSavedDestination(city._id);
    } else {
      if (saveDestination) saveDestination(city._id);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={city.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80'}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <button
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-amber-500 text-white shadow'
              : 'bg-slate-900/60 text-white hover:bg-slate-900'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save destination'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm border border-slate-700">
            {city.country} • {city.region}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white tracking-tight drop-shadow">
            {city.name}
          </h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {city.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Cost Index</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">{city.costIndex} / 100</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Popularity</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">{city.popularity} / 100</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={() => onViewDetails && onViewDetails(city)}
            className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onAdd ? onAdd(city) : onSelect(city)}
            disabled={isAddedInCurrentTrip}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              isAddedInCurrentTrip
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            {isAddedInCurrentTrip ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityCard;
