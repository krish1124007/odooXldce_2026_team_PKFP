import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bookmark, Settings, Trash2, Save, AlertCircle, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, logout, updateProfile, deleteAccount, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Balanced');
  const [travelPace, setTravelPace] = useState(user?.travelPace || 'Moderate');
  const [interests, setInterests] = useState(user?.interests || []);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  const [savedDestinationsList, setSavedDestinationsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const allInterests = ['Food', 'Culture', 'Nature', 'Adventure', 'History', 'Nightlife', 'Shopping', 'Photography'];

  useEffect(() => {
    fetchSavedDestinations();
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

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10">
      {/* User Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
          {profilePhoto ? (
            <img src={profilePhoto} alt="" className="w-full h-full rounded-[14px] object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs text-slate-400">{user?.email} • Member since 2026</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Travel Profile & Preferences</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
              >
                <option value="Budget">Budget Explorer</option>
                <option value="Balanced">Balanced Traveler</option>
                <option value="Luxury">Luxury & Comfort</option>
                <option value="Backpacking">Backpacking / Solo</option>
                <option value="Family">Family Friendly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Travel Pace
              </label>
              <select
                value={travelPace}
                onChange={(e) => setTravelPace(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
              >
                <option value="Relaxed">Relaxed (1-2 activities/day)</option>
                <option value="Moderate">Moderate (3 activities/day)</option>
                <option value="Fast-paced">Fast-paced (4+ activities/day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English, Spanish..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Interests & Favorites
            </label>
            <div className="flex flex-wrap gap-2">
              {allInterests.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Saved Destinations Section */}
      <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Bookmark className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Saved Destinations</h2>
        </div>

        {!savedDestinationsList || savedDestinationsList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No saved destinations yet. Explore cities and click the bookmark icon to save them here!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDestinationsList.map((city) => (
              <div
                key={city._id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  {city.image && (
                    <img src={city.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {city.name}
                    </p>
                    <p className="text-xs text-slate-400">{city.country} • {city.region}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSaved(city._id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove saved destination"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Danger Zone</h3>
          <p className="text-xs text-slate-400">Permanently delete your user account and all created trip data.</p>
        </div>

        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-semibold text-xs transition-all shrink-0"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
