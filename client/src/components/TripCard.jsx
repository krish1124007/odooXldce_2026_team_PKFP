import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Edit, Trash2, ArrowRight } from 'lucide-react';
import './TripCard.css';

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
        return <span className="trip-badge status-upcoming">Upcoming</span>;
      case 'ONGOING':
        return <span className="trip-badge status-ongoing">Ongoing</span>;
      case 'COMPLETED':
        return <span className="trip-badge status-completed">Completed</span>;
      default:
        return <span className="trip-badge status-draft">Draft</span>;
    }
  };

  return (
    <div className="trip-card-container">
      <div className="trip-card-image-box">
        <img
          src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.name}
          className="trip-card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="trip-card-overlay-gradient" />

        <div className="trip-card-top-tags">
          {getStatusBadge(trip.status)}
          <span className="visibility-badge">
            {trip.visibility}
          </span>
        </div>

        <div className="trip-card-title-box">
          <h3 className="trip-card-name">
            {trip.name}
          </h3>
        </div>
      </div>

      <div className="trip-card-body-content">
        {trip.description && (
          <p className="trip-card-desc">{trip.description}</p>
        )}

        <div className="trip-card-meta-list">
          <div className="meta-row font-medium">
            <Calendar size={15} className="meta-icon-blue" />
            <span>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </span>
          </div>

          <div className="meta-row">
            <MapPin size={15} className="meta-icon-blue" />
            <span>
              {trip.destinations?.length || 0} Destination
              {trip.destinations?.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="meta-row">
            <DollarSign size={15} className="meta-icon-green" />
            <span>
              Budget: {trip.budget?.amount ? `₹${trip.budget.amount.toLocaleString()}` : 'Not set'}
            </span>
          </div>
        </div>

        <div className="trip-card-footer-bar">
          <div className="icon-actions-group">
            <Link
              to={`/trips/${trip._id}/edit`}
              className="action-icon-link"
              title="Edit Trip"
            >
              <Edit size={15} />
            </Link>
            <button
              onClick={() => onDelete(trip._id, trip.name)}
              className="action-icon-link danger"
              title="Delete Trip"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <Link
            to={`/trips/${trip._id}/builder`}
            className="btn-view-trip-link"
          >
            <span>View Trip</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
