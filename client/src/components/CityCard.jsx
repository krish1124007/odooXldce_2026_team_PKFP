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
    <div className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={city.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80'}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <button
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-amber-500/90 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save destination'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-slate-800">
            {city.country} • {city.region}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
            {city.name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {city.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Cost Index</p>
              <p className="font-bold text-slate-200">{city.costIndex} / 100</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Popularity</p>
              <p className="font-bold text-slate-200">{city.popularity} / 100</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={() => onViewDetails && onViewDetails(city)}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onAdd ? onAdd(city) : onSelect(city)}
            disabled={isAddedInCurrentTrip}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              isAddedInCurrentTrip
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-md shadow-cyan-500/20'
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
