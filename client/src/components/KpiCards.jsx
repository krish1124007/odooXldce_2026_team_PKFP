import React from 'react';
import { Compass, MapPin, Bookmark, Sparkles } from 'lucide-react';
import './KpiCards.css';

export default function KpiCards({ kpiData }) {
  const defaultData = {
    totalTrips: 12,
    upcomingJourneys: 2,
    savedDestinations: 8,
    pendingProposals: 3,
  };

  const data = { ...defaultData, ...kpiData };

  const cards = [
    {
      id: 'trips',
      title: 'Total Trips',
      value: data.totalTrips,
      icon: Compass,
    },
    {
      id: 'upcoming',
      title: 'Upcoming Journeys',
      value: data.upcomingJourneys,
      icon: MapPin,
    },
    {
      id: 'saved',
      title: 'Saved Destinations',
      value: data.savedDestinations,
      icon: Bookmark,
    },
    {
      id: 'proposals',
      title: 'Pending AI Proposals',
      value: data.pendingProposals,
      icon: Sparkles,
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div className="dashboard-card kpi-card" key={card.id}>
            <div className="kpi-header">
              <span className="kpi-title">{card.title}</span>
              <div className="kpi-icon-box">
                <IconComponent size={20} />
              </div>
            </div>
            <div className="kpi-value">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
}
