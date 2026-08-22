import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TripCard from '../components/TripCard';
import { Plus, Search, Filter, Compass, ArrowUpDown } from 'lucide-react';
import './MyTripsPage.css';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, sortBy]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let url = `/trips?sort=${sortBy}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data && res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user trips:', err);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleDeleteTrip = async (tripId, tripName) => {
    if (window.confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/trips/${tripId}`);
        if (res.data && res.data.success) {
          fetchTrips();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete trip.');
      }
    }
  };

  return (
    <div className="my-trips-container">
      {/* Top Header */}
      <div className="my-trips-header-row">
        <div>
          <h1 className="page-main-title">My Trips</h1>
          <p className="page-sub-title">View and manage all your personal travel itineraries</p>
        </div>

        <Link to="/trips/create" className="btn-primary-action">
          <Plus size={18} />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-trips-controls-bar">
        <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by name or destination..."
            className="search-input-field"
          />
        </form>

        <div className="filter-controls-right">
          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="custom-select-element"
            >
              <option value="">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="select-control-box">
            <ArrowUpDown size={15} className="control-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select-element"
            >
              <option value="createdAt">Newest First</option>
              <option value="startDate">Start Date</option>
              <option value="name">Trip Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips Grid / Empty State */}
      {loading ? (
        <div className="loading-state-box">
          <div className="gt-spinner-lg" />
          <p>Loading your trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-trips-card">
          <div className="empty-icon-circle">
            <Compass size={32} />
          </div>
          <h3 className="empty-title-text">No trips found</h3>
          <p className="empty-desc-text">
            {search || statusFilter
              ? 'No trips match your search filters. Try clearing your search or status filter.'
              : 'You have not planned any travel itineraries yet. Start your next adventure now!'}
          </p>
          <Link to="/trips/create" className="btn-primary-action">
            <Plus size={18} />
            <span>Create New Trip</span>
          </Link>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
          ))}
        </div>
      )}
    </div>
  );
}
