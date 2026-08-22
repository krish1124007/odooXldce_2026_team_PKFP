import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import './HeroBanner.css';

export default function HeroBanner({ onPlanTrip, onOpenReports }) {
  const formattedDate = "Saturday, August 22, 2026";

  return (
    <div className="hero-banner">
      <div className="hero-text-content">
        <h1 className="hero-title">Welcome back, Traveler</h1>
        <p className="hero-date">{formattedDate}</p>
      </div>

      <div className="hero-actions">
        <button className="btn-reports" onClick={onOpenReports}>
          <Sparkles size={16} />
          <span>AI Assistant</span>
        </button>

        <button className="btn-add-employee" onClick={onPlanTrip}>
          <Plus size={18} />
          <span>Plan New Trip</span>
        </button>
      </div>
    </div>
  );
}
