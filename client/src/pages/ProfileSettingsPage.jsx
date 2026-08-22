import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bookmark, Settings, Trash2, Save, AlertCircle, Check, Compass, Calendar, MapPin, ArrowRight } from 'lucide-react';
import './ProfileSettingsPage.css';

export default function ProfileSettingsPage() {
  const { user, updateProfile, deleteAccount, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Balanced');
  const [travelPace, setTravelPace] = useState(user?.travelPace || 'Moderate');
  const [interests, setInterests] = useState(user?.interests || []);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  const [savedDestinationsList, setSavedDestinationsList] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const allInterests = ['Food', 'Culture', 'Nature', 'Adventure', 'History', 'Nightlife', 'Shopping', 'Photography'];

  useEffect(() => {
    fetchSavedDestinations();
    fetchUserTrips();
  }, []);

  const fetchSavedDestinations = async () => {
    try {
      const res = await api.get('/users/saved-destinations');
      if (res.data && res.data.success) {
        setSavedDestinationsList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch saved destinations:', err);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const res = await api.get('/trips?limit=100');
      if (res.data && res.data.success) {
        setUserTrips(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user trips for profile:', err);
    }
  };

  // Categorize trips into Preplanned (Upcoming/Ongoing) and Previous (Completed)
  const preplannedTrips = useMemo(() => {
    return userTrips.filter((t) => {
      if (t.status === 'COMPLETED') return false;
      const now = new Date();
      const end = t.endDate ? new Date(t.endDate) : null;
      if (end && now > end) return false;
      return true;
    });
  }, [userTrips]);

  const previousTrips = useMemo(() => {
    return userTrips.filter((t) => {
      if (t.status === 'COMPLETED') return true;
      const now = new Date();
      const end = t.endDate ? new Date(t.endDate) : null;
      if (end && now > end) return true;
      return false;
    });
  }, [userTrips]);

  const handleRemoveSaved = async (cityId) => {
    try {
      const res = await api.delete(`/users/saved-destinations/${cityId}`);
      if (res.data && res.data.success) {
        setSavedDestinationsList(res.data.data);
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove saved destination');
    }
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const res = await updateProfile({
        firstName,
        lastName,
        language,
        travelStyle,
        travelPace,
        interests,
        profilePhoto,
      });

      if (res.success) {
        setMessage('Profile and travel preferences updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete your account and all associated trips? This cannot be undone.')) {
      try {
        const res = await deleteAccount();
        if (res.success) {
          navigate('/signup');
        }
      } catch (err) {
        alert('Failed to delete account.');
      }
    }
  };

  const formatDate = (d) => {
    if (!d) return 'TBD';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-page-container">
      {/* 1. USER DETAILS HEADER & PREFERENCES CARD (MATCHING WIREFRAME TOP SECTION) */}
      <div className="profile-header-card">
        {/* Left: User Avatar */}
        <div className="profile-avatar-container">
          <div className="profile-avatar-circle">
            {profilePhoto ? (
              <img src={profilePhoto} alt={user?.firstName} className="profile-avatar-img" />
            ) : (
              <span>{user?.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
            )}
          </div>
          <span className="profile-badge-role">Traveler</span>
        </div>

        {/* Right: User Details Form */}
        <div className="profile-details-wrapper">
          <div className="profile-details-title-bar">
            <div>
              <h1 className="profile-name-text">
                {user?.firstName || 'Traveler'} {user?.lastName || ''}
              </h1>
              <p className="profile-email-text">{user?.email} • Member since 2026</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 text-xs font-bold border border-blue-100 dark:border-slate-700">
              ⚙️ Account Preferences
            </span>
          </div>

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="gt-form-group">
                <label className="gt-form-label">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="gt-form-input"
                />
              </div>

              <div className="gt-form-group">
                <label className="gt-form-label">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="gt-form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="gt-form-group">
                <label className="gt-form-label">Travel Style</label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="gt-form-select"
                >
                  <option value="Budget">Budget Explorer</option>
                  <option value="Balanced">Balanced Traveler</option>
                  <option value="Luxury">Luxury & Comfort</option>
                  <option value="Backpacking">Backpacking / Solo</option>
                  <option value="Family">Family Friendly</option>
                </select>
              </div>

              <div className="gt-form-group">
                <label className="gt-form-label">Travel Pace</label>
                <select
                  value={travelPace}
                  onChange={(e) => setTravelPace(e.target.value)}
                  className="gt-form-select"
                >
                  <option value="Relaxed">Relaxed (1-2 activities/day)</option>
                  <option value="Moderate">Moderate (3 activities/day)</option>
                  <option value="Fast-paced">Fast-paced (4+ activities/day)</option>
                </select>
              </div>

              <div className="gt-form-group">
                <label className="gt-form-label">Preferred Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="English, Spanish..."
                  className="gt-form-input"
                />
              </div>
            </div>

            <div className="gt-form-group">
              <label className="gt-form-label">Interests & Favorites</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {allInterests.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <Save size={16} />
                <span>{saving ? 'Saving Profile...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. PREPLANNED TRIPS SECTION (MATCHING WIREFRAME MIDDLE SECTION) */}
      <div className="profile-section-card">
        <h2 className="profile-section-title">
          <Compass className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <span>Preplanned Trips</span>
        </h2>

        {preplannedTrips.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            No upcoming preplanned trips yet.{' '}
            <Link to="/trips/create" className="text-blue-600 dark:text-cyan-400 hover:underline">
              Plan a new journey →
            </Link>
          </div>
        ) : (
          <div className="profile-trips-grid">
            {preplannedTrips.map((trip) => (
              <div key={trip._id} className="profile-trip-card">
                <div>
                  <h3 className="profile-trip-name">{trip.name}</h3>
                  <p className="profile-trip-dates flex items-center gap-1">
                    <Calendar size={13} className="text-blue-600 dark:text-cyan-400" />
                    <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    📍 {trip.destinations?.length || 0} destinations
                  </p>
                </div>
                <div className="flex justify-end">
                  <Link to={`/trips/${trip._id}/itinerary`} className="profile-trip-view-btn">
                    <span>View</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PREVIOUS TRIPS SECTION (MATCHING WIREFRAME BOTTOM TRIPS SECTION) */}
      <div className="profile-section-card">
        <h2 className="profile-section-title">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Previous Trips</span>
        </h2>

        {previousTrips.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            No completed past trips found.
          </div>
        ) : (
          <div className="profile-trips-grid">
            {previousTrips.map((trip) => (
              <div key={trip._id} className="profile-trip-card">
                <div>
                  <h3 className="profile-trip-name">{trip.name}</h3>
                  <p className="profile-trip-dates flex items-center gap-1">
                    <Calendar size={13} className="text-purple-600 dark:text-purple-400" />
                    <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    📍 {trip.destinations?.length || 0} destinations
                  </p>
                </div>
                <div className="flex justify-end">
                  <Link to={`/trips/${trip._id}/itinerary`} className="profile-trip-view-btn">
                    <span>View</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SAVED DESTINATIONS SECTION */}
      <div className="profile-section-card">
        <h2 className="profile-section-title">
          <Bookmark className="w-5 h-5 text-amber-500" />
          <span>Saved Destinations</span>
        </h2>

        {!savedDestinationsList || savedDestinationsList.length === 0 ? (
          <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            No saved destinations yet. Explore cities and click the bookmark icon to save them here!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDestinationsList.map((city) => (
              <div
                key={city._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center space-x-3">
                  {city.image && (
                    <img src={city.image} alt={city.name} className="w-12 h-12 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {city.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{city.country} • {city.region}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSaved(city._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Remove saved destination"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. DANGER ZONE */}
      <div className="danger-zone-card">
        <div>
          <h3 className="danger-zone-title">Danger Zone</h3>
          <p className="danger-zone-desc">Permanently delete your user account and all created trip data.</p>
        </div>

        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-md hover:bg-rose-700 transition-all shrink-0"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
