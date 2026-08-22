import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Edit, Trash2, ArrowRight } from 'lucide-react';

const TripCard = ({ trip, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Upcoming</span>;
      case 'ONGOING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Ongoing</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>;
    }
  };

  return (
    <div className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col shadow-lg hover:shadow-cyan-500/5">
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {getStatusBadge(trip.status)}
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
            {trip.visibility}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white truncate drop-shadow-md">
            {trip.name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {trip.description && (
          <p className="text-xs text-slate-400 line-clamp-2">{trip.description}</p>
        )}

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {trip.destinations?.length || 0} Destination
              {trip.destinations?.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Budget: {trip.budget?.amount ? `₹${trip.budget.amount.toLocaleString()}` : 'Not set'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              to={`/trips/${trip._id}/edit`}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit Trip"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(trip._id, trip.name)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={`/trips/${trip._id}/builder`}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all duration-200"
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
