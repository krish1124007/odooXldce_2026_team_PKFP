import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import KpiCards from '../components/KpiCards';
import { MapPin, Calendar, Compass, ArrowRight } from 'lucide-react';
import '../App.css';

export default function DashboardPage() {
  const { setIsCreateTripOpen, setIsAddEmployeeOpen, setIsReportsOpen, kpiData } = useOutletContext();
  const navigate = useNavigate();

  const handlePlanTrip = () => {
    if (setIsCreateTripOpen) {
      setIsCreateTripOpen(true);
    } else if (setIsAddEmployeeOpen) {
      setIsAddEmployeeOpen(true);
    }
  };

  const upcomingTrips = [
    {
      id: 'demo-trip-123',
      title: 'Autumn in Japan',
      dates: 'Oct 12 - Oct 24, 2026',
      destination: 'Tokyo & Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      tag: 'Upcoming'
    },
    {
      id: 'demo-trip-456',
      title: 'French Riviera Getaway',
      dates: 'Dec 05 - Dec 15, 2026',
      destination: 'Nice & Monaco, France',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      tag: 'Planning'
    }
  ];

  return (
    <>
      {/* Hero Banner Section */}
      <HeroBanner 
        onPlanTrip={handlePlanTrip}
        onOpenReports={() => setIsReportsOpen(true)}
      />

      {/* Top KPI Metrics */}
      <KpiCards kpiData={kpiData} />

      {/* Travel Dashboard Section */}
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="grid-column chart-column">
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={20} color="#2563eb" /> Active & Upcoming Journeys
              </h3>
              <button 
                onClick={() => navigate('/trips')} 
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingTrips.map((trip) => (
                <div 
                  key={trip.id} 
                  onClick={() => navigate(`/trips/${trip.id}/builder`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <img 
                    src={trip.image} 
                    alt={trip.title} 
                    style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{trip.title}</h4>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        background: trip.tag === 'Upcoming' ? '#dbeafe' : '#fef3c7',
                        color: trip.tag === 'Upcoming' ? '#1e40af' : '#92400e',
                        fontWeight: 600
                      }}>
                        {trip.tag}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {trip.destination}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {trip.dates}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={18} color="#94a3b8" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-column widget-column">
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handlePlanTrip}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                + Plan New Journey
              </button>
              <button 
                onClick={() => navigate('/trips/demo-trip-123/cities')}
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                Explore Destinations
              </button>
              <button 
                onClick={() => navigate('/trips/demo-trip-123/budget')}
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                Manage Trip Budgets
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
