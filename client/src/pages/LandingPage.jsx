import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Layers, 
  Plus, 
  MapPin, 
  Calendar, 
  Compass, 
  Eye, 
  ChevronRight, 
  Sparkles,
  Heart,
  Globe
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './LandingPage.css';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popularity');
  const [isFilterActive, setIsFilterActive] = useState(false);

  const navigate = useNavigate();
  const context = useOutletContext();
  const setIsAddEmployeeOpen = context?.setIsAddEmployeeOpen;

  // Regional Selections Data
  const regionalSelections = [
    {
      id: 'japan',
      name: 'East Asia',
      tag: 'Japan & Korea',
      count: '42 Itineraries',
      image: '/region_tokyo.png',
      badge: 'Popular'
    },
    {
      id: 'europe',
      name: 'Western Europe',
      tag: 'France & Italy',
      count: '38 Itineraries',
      image: '/hero_banner.png',
      badge: 'Trending'
    },
    {
      id: 'tropical',
      name: 'Southeast Asia',
      tag: 'Bali & Thailand',
      count: '29 Itineraries',
      image: '/region_tokyo.png',
      badge: 'Top Rated'
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean',
      tag: 'Greece & Spain',
      count: '35 Itineraries',
      image: '/hero_banner.png',
      badge: 'Featured'
    },
    {
      id: 'alps',
      name: 'Alpine Europe',
      tag: 'Swiss & Austria',
      count: '24 Itineraries',
      image: '/region_tokyo.png',
      badge: 'Scenic'
    }
  ];

  // Previous Trips Data
  const previousTrips = [
    {
      id: 'japan-2026',
      title: 'Japan Culture & Food Tour',
      dates: 'Oct 10 - Oct 20, 2026',
      cities: '3 Cities (Tokyo, Kyoto, Osaka)',
      status: 'UPCOMING',
      budget: '₹85,000',
      image: '/hero_banner.png',
      activitiesCount: 14
    },
    {
      id: 'europe-2026',
      title: 'European Grand Highlights',
      dates: 'Dec 01 - Dec 15, 2026',
      cities: '4 Cities (Paris, Rome, Venice, Zurich)',
      status: 'DRAFT',
      budget: '₹1,20,000',
      image: '/region_tokyo.png',
      activitiesCount: 18
    },
    {
      id: 'bali-2026',
      title: 'Bali Wellness & Beach Escape',
      dates: 'Jan 05 - Jan 12, 2027',
      cities: '2 Cities (Ubud, Seminyak)',
      status: 'COMPLETED',
      budget: '₹45,000',
      image: '/hero_banner.png',
      activitiesCount: 9
    }
  ];

  const filteredTrips = previousTrips.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cities.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="landing-container">
      {/* 1. Large Prominent Banner Image Section */}
      <div className="hero-banner-card">
        <img 
          src="/hero_banner.png" 
          alt="GlobeTrotter Hero Banner" 
          className="hero-banner-img"
        />
        <div className="hero-banner-overlay">
          <div className="hero-badge-pill">
            <Sparkles size={14} />
            <span>Agentic AI Travel Platform</span>
          </div>
          <h1 className="hero-banner-title">Discover, Plan & Journey Together</h1>
          <p className="hero-banner-sub">
            Multi-city itineraries, deterministic budget optimization, and AI agents reasoning on your travel goals.
          </p>
          <div className="hero-banner-actions">
            <button className="banner-btn-primary" onClick={() => navigate('/trips/create')}>
              <Plus size={16} />
              <span>Start New Journey</span>
            </button>
            <button className="banner-btn-secondary" onClick={() => navigate('/trips')}>
              <Compass size={16} />
              <span>Browse My Trips</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Controls Bar (Matching Wireframe: Search Bar | Group by | Filter | Sort by) */}
      <div className="controls-bar">
        <div className="search-bar-input-box">
          <Search size={17} className="search-bar-icon" />
          <input 
            type="text" 
            placeholder="Search destinations, cities, itineraries..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar-field"
          />
        </div>

        <div className="filter-controls-group">
          {/* Group By Dropdown */}
          <div className="dropdown-control">
            <button className="control-btn">
              <Layers size={15} />
              <span>Group by: {selectedGroup}</span>
            </button>
          </div>

          {/* Filter Toggle */}
          <button 
            className={`control-btn ${isFilterActive ? 'active' : ''}`}
            onClick={() => setIsFilterActive(!isFilterActive)}
          >
            <Filter size={15} />
            <span>Filter</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="dropdown-control">
            <button className="control-btn">
              <ArrowUpDown size={15} />
              <span>Sort by: {selectedSort}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top Regional Selections Section (Matching Wireframe Row of 5 Cards) */}
      <section className="landing-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-main-title">Top Regional Selections</h2>
            <p className="section-sub-title">Explore handpicked popular travel regions and curated multi-city routes</p>
          </div>
          <Link to="/trips/demo-trip-123/cities" className="view-all-link">
            <span>View All Regions</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="regional-cards-grid custom-scrollbar">
          {regionalSelections.map((region) => (
            <div 
              className="region-card" 
              key={region.id}
              onClick={() => navigate('/trips/demo-trip-123/cities')}
            >
              <div className="region-img-wrapper">
                <img src={region.image} alt={region.name} className="region-img" />
                <span className="region-badge">{region.badge}</span>
              </div>
              <div className="region-card-body">
                <h3 className="region-title">{region.name}</h3>
                <span className="region-tag">{region.tag}</span>
                <div className="region-footer flex items-center justify-between mt-2">
                  <span className="region-count">{region.count}</span>
                  <span className="region-arrow">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Previous Trips Section (Matching Wireframe Taller Vertical Cards) */}
      <section className="landing-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-main-title">Previous Trips</h2>
            <p className="section-sub-title">Your saved, draft, and upcoming trip itineraries</p>
          </div>
          <Link to="/trips" className="view-all-link">
            <span>Manage All Trips</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="previous-trips-grid">
          {filteredTrips.map((trip) => (
            <div className="trip-vertical-card" key={trip.id}>
              <div className="trip-card-banner">
                <img src={trip.image} alt={trip.title} className="trip-card-img" />
                <span className={`trip-status-tag ${trip.status.toLowerCase()}`}>
                  {trip.status}
                </span>
              </div>

              <div className="trip-card-content">
                <h3 className="trip-card-title">{trip.title}</h3>

                <div className="trip-card-meta">
                  <div className="meta-item">
                    <Calendar size={14} className="meta-icon" />
                    <span>{trip.dates}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} className="meta-icon" />
                    <span>{trip.cities}</span>
                  </div>
                </div>

                <div className="trip-card-footer">
                  <div className="trip-budget-info">
                    <span className="budget-label">Estimated Budget</span>
                    <span className="budget-value">{trip.budget}</span>
                  </div>

                  <div className="trip-actions">
                    <Link to={`/trips/${trip.id}/itinerary`}>
                      <button className="trip-action-btn primary" title="View Itinerary">
                        <Eye size={15} />
                        <span>View</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Floating Action Button (Matching Wireframe Bottom Right "+ Plan a trip") */}
      <button 
        className="floating-plan-trip-btn"
        onClick={() => navigate('/trips/create')}
        title="Plan a new trip"
      >
        <Plus size={20} />
        <span>Plan a trip</span>
      </button>
    </div>
  );
}
