import React from 'react';
import { Clock, DollarSign, Plus, Check, Trash2, Eye } from 'lucide-react';
import './ActivityCard.css';

const ActivityCard = ({ activity, onAdd, onRemove, isAdded, onViewDetails }) => {
  const formatDuration = (mins) => {
    if (!mins) return 'Flex';
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0 && m > 0) return `${hrs}h ${m}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${m}m`;
  };

  return (
    <div className="activity-card-container">
      {/* Media Image Header */}
      <div className="activity-card-media">
        <img
          src={activity.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'}
          alt={activity.name}
          className="activity-card-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="activity-card-gradient" />

        <div className="activity-type-tag">
          {activity.type}
        </div>

        {activity.cityId?.name && (
          <div className="activity-city-tag">
            {activity.cityId.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="activity-card-content">
        <div>
          <h4 className="activity-name-text">
            {activity.name}
          </h4>
          <p className="activity-desc-text">
            {activity.description}
          </p>
        </div>

        {/* Cost & Duration Row */}
        <div className="activity-meta-row">
          <div className="activity-cost-badge">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{activity.cost === 0 ? 'Free' : `₹${activity.cost.toLocaleString()}`}</span>
          </div>

          <div className="activity-duration-badge">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(activity.durationMinutes)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="activity-actions-group">
          <button
            onClick={() => onViewDetails && onViewDetails(activity)}
            className="btn-card-action outline"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Details</span>
          </button>

          {isAdded ? (
            <div className="flex-1 flex items-center gap-1">
              <span className="btn-card-action added">
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </span>
              <button
                onClick={() => onRemove && onRemove(activity)}
                className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                title="Remove from trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd && onAdd(activity)}
              className="btn-card-action primary"
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
