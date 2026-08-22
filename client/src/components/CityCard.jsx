import React from 'react';
import { Bookmark, Plus, Check, Eye, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CityCard.css';

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

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(city);
    } else if (onSelect) {
      onSelect(city);
    }
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(city);
    }
  };

  return (
    <div className="city-card-container">
      {/* Media Image Header */}
      <div className="city-card-media">
        <img
          src={city.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80'}
          alt={city.name}
          className="city-card-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="city-card-gradient" />

        <button
          onClick={handleToggleSave}
          className={`city-bookmark-btn ${isSaved ? 'saved' : ''}`}
          title={isSaved ? 'Remove from saved' : 'Save destination'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <div className="city-badge-tag">
          {city.country} • {city.region}
        </div>

        <div className="city-title-overlay">
          <h3 className="city-name-text">
            {city.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="city-card-content">
        <p className="city-desc-text">
          {city.description}
        </p>

        {/* Metrics Grid */}
        <div className="city-metrics-grid">
          <div className="metric-pill-box">
            <div className="metric-icon-wrap cost">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="metric-label-text">Cost Index</div>
              <div className="metric-val-text">{city.costIndex} / 100</div>
            </div>
          </div>

          <div className="metric-pill-box">
            <div className="metric-icon-wrap popularity">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="metric-label-text">Popularity</div>
              <div className="metric-val-text">{city.popularity} / 100</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="city-actions-group">
          <button
            onClick={handleDetailsClick}
            className="btn-card-action outline"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Details</span>
          </button>

          <button
            onClick={handleAddClick}
            disabled={isAddedInCurrentTrip}
            className={`btn-card-action ${isAddedInCurrentTrip ? 'added' : 'primary'}`}
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
