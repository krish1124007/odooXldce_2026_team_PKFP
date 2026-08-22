import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import { 
  Compass, 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ImageIcon, 
  FileText, 
  Lock, 
  Sparkles,
  Search,
  X,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  Plus,
  Info
} from 'lucide-react';
import './CreateTripPage.css';

const PRESET_COVERS = [
  { id: 1, name: 'Japan Culture', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { id: 2, name: 'Alpine Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { id: 3, name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { id: 4, name: 'European City', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' }
];

export default function CreateTripPage() {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [visibility, setVisibility] = useState('PRIVATE');

  // Destination Search & Selection
  const [citySearch, setCitySearch] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Recommendations / Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Search Cities Autocomplete
  useEffect(() => {
    if (!citySearch.trim()) {
      setCitySearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCitySearchLoading(true);
      try {
        const res = await api.get(`/cities?search=${encodeURIComponent(citySearch.trim())}&limit=6`);
        if (res.data && res.data.success) {
          setCitySearchResults(res.data.data || []);
          setShowCityDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search cities:', err);
      } finally {
        setCitySearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [citySearch]);

  // Fetch Activity Suggestions when a city is selected
  useEffect(() => {
    if (selectedCity && selectedCity._id) {
      fetchSuggestions(selectedCity._id);
    } else {
      setSuggestions([]);
    }
  }, [selectedCity]);

  // Close city search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (cityId) => {
    setSuggestionsLoading(true);
    try {
      const res = await api.get(`/activities?cityId=${cityId}&limit=6`);
      if (res.data && res.data.success) {
        setSuggestions(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setCitySearch('');
    setShowCityDropdown(false);

    // Auto-fill cover photo if empty and city has an image
    if (!coverPhoto && city.image) {
      setCoverPhoto(city.image);
    }
  };

  const handleRemoveCity = () => {
    setSelectedCity(null);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Trip name is required.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date cannot be before start date.');
      return;
    }

    if (budgetAmount && Number(budgetAmount) < 0) {
      setError('Planned budget cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        startDate,
        endDate,
        coverPhoto: coverPhoto.trim() || selectedCity?.image || PRESET_COVERS[0].url,
        budget: {
          amount: Number(budgetAmount) || 0,
          currency,
        },
        visibility,
        destinations: selectedCity ? [selectedCity._id] : [],
      };

      const res = await api.post('/trips', payload);
      if (res.data && res.data.success) {
        const newTripId = res.data.data._id;
        navigate(`/trips/${newTripId}/builder`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Dates not set';
    const s = startDate ? new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...';
    const e = endDate ? new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '...';
    return `${s} — ${e}`;
  };

  const displayCoverImage = coverPhoto.trim() || selectedCity?.image || PRESET_COVERS[0].url;

  return (
    <div className="create-trip-screen-wrapper">
      {/* Top Header */}
      <div className="create-trip-screen-header">
        <Link to="/trips" className="back-link-btn">
          <ArrowLeft size={16} />
          <span>Back to My Trips</span>
        </Link>
        <div className="header-text-block">
          <h1 className="screen-title text-slate-900">Plan a new trip</h1>
          <p className="screen-subtitle text-slate-500">
            Start with the basics and build your perfect itinerary
          </p>
        </div>
      </div>

      {/* Main Content Layout: Form + Preview */}
      <div className="create-trip-main-grid">
        {/* Left Column: Form Card */}
        <div className="create-trip-form-card">
          {error && (
            <div className="error-alert-banner">
              <AlertCircle size={16} className="error-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-trip-form-body">
            {/* SECTION 1: TRIP DETAILS */}
            <div className="form-section-header">
              <span className="section-step-badge">1</span>
              <h2 className="section-title">Trip Details</h2>
            </div>

            {/* Trip Name */}
            <div className="form-input-group">
              <label className="input-field-label">
                Trip Name <span className="required-star">*</span>
              </label>
              <div className="input-field-wrapper">
                <MapPin size={16} className="input-field-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Japan Food & Culture"
                  className="input-field-element"
                />
              </div>
            </div>

            {/* Destination Selector */}
            <div className="form-input-group" ref={dropdownRef}>
              <label className="input-field-label">Destination</label>
              
              {selectedCity ? (
                /* Selected City Chip/Card */
                <div className="selected-city-chip">
                  <img
                    src={selectedCity.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=400&q=80'}
                    alt={selectedCity.name}
                    className="chip-city-img"
                  />
                  <div className="chip-city-info">
                    <span className="chip-city-name">{selectedCity.name}</span>
                    <span className="chip-city-country">{selectedCity.country} • {selectedCity.region}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCity}
                    className="chip-remove-btn"
                    title="Remove destination"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                /* Autocomplete Search Input */
                <div className="destination-search-container">
                  <div className="input-field-wrapper">
                    <Search size={16} className="input-field-icon" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onFocus={() => { if (citySearchResults.length > 0) setShowCityDropdown(true); }}
                      placeholder="Search for a city or destination..."
                      className="input-field-element"
                    />
                    {citySearchLoading && (
                      <div className="search-spinner-icon" />
                    )}
                  </div>

                  {/* Dropdown Popover */}
                  {showCityDropdown && citySearchResults.length > 0 && (
                    <div className="city-search-dropdown">
                      {citySearchResults.map((city) => (
                        <div
                          key={city._id}
                          onClick={() => handleSelectCity(city)}
                          className="city-dropdown-item"
                        >
                          <img
                            src={city.image || 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=200&q=80'}
                            alt={city.name}
                            className="dropdown-item-img"
                          />
                          <div className="dropdown-item-info">
                            <span className="dropdown-city-name">{city.name}</span>
                            <span className="dropdown-city-sub">{city.country} • {city.region}</span>
                          </div>
                          {city.popularity > 0 && (
                            <span className="dropdown-pop-badge">★ {city.popularity}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Start and End Dates */}
            <div className="form-grid-two-cols">
              <div className="form-input-group">
                <label className="input-field-label">
                  Start Date <span className="required-star">*</span>
                </label>
                <div className="input-field-wrapper">
                  <Calendar size={16} className="input-field-icon" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field-element"
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label className="input-field-label">
                  End Date <span className="required-star">*</span>
                </label>
                <div className="input-field-wrapper">
                  <Calendar size={16} className="input-field-icon" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field-element"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ABOUT YOUR TRIP */}
            <div className="form-section-header mt-2">
              <span className="section-step-badge">2</span>
              <h2 className="section-title">About Your Trip</h2>
            </div>

            {/* Description */}
            <div className="form-input-group">
              <label className="input-field-label">Trip Description</label>
              <div className="input-field-wrapper textarea-wrapper">
                <FileText size={16} className="input-field-icon textarea-icon" />
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us a little about what you want from this trip..."
                  className="input-field-element textarea-element"
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div className="form-input-group">
              <label className="input-field-label">Cover Photo</label>

              {/* Cover Image Preview */}
              <div className="cover-photo-preview-box">
                <img
                  src={displayCoverImage}
                  alt="Cover Preview"
                  className="cover-preview-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="cover-preview-overlay">
                  <span className="preview-label">Cover Preview</span>
                </div>
              </div>

              <div className="input-field-wrapper">
                <ImageIcon size={16} className="input-field-icon" />
                <input
                  type="url"
                  value={coverPhoto}
                  onChange={(e) => setCoverPhoto(e.target.value)}
                  placeholder="Paste custom image URL..."
                  className="input-field-element"
                />
              </div>

              {/* Preset Covers Selector */}
              <div className="preset-covers-bar">
                <span className="preset-label">Or choose a preset cover:</span>
                <div className="preset-items-row">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCoverPhoto(preset.url)}
                      className={`preset-cover-thumb ${coverPhoto === preset.url ? 'active' : ''}`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget & Visibility */}
            <div className="form-grid-two-cols">
              <div className="form-input-group">
                <label className="input-field-label">Planned Budget</label>
                <div className="input-split-row">
                  <div className="input-field-wrapper flex-1">
                    <DollarSign size={16} className="input-field-icon" />
                    <input
                      type="number"
                      min="0"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="80000"
                      className="input-field-element"
                    />
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="currency-select-box"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div className="form-input-group">
                <label className="input-field-label">Visibility</label>
                <div className="input-field-wrapper">
                  <Lock size={16} className="input-field-icon" />
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="input-field-element select-element"
                  >
                    <option value="PRIVATE">Private (Only Me)</option>
                    <option value="PUBLIC">Public (Shareable)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Agent Entry Point Banner */}
            <div className="ai-plan-banner">
              <div className="ai-banner-left">
                <div className="ai-sparkle-badge">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="ai-banner-title">✨ Plan this trip with AI</h4>
                  <p className="ai-banner-desc">Let GlobeTrotter suggest destinations, activities, and an itinerary based on your preferences.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('✨ AI Planning Assistant will generate itinerary proposals after trip setup in Phase 6.')}
                className="btn-ai-banner"
              >
                Plan with AI
              </button>
            </div>

            {/* Form Footer Actions */}
            <div className="form-footer-actions">
              <Link to="/trips" className="btn-form-cancel">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-form-submit"
              >
                {loading ? (
                  <span>Creating Trip...</span>
                ) : (
                  <>
                    <Compass size={16} />
                    <span>Create Trip</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Desktop Live Trip Preview */}
        <div className="create-trip-preview-col">
          <div className="preview-card-sticky">
            <div className="preview-card-header-bar">
              <span className="preview-badge">Live Preview</span>
            </div>

            <div className="live-preview-card">
              <div className="preview-card-media">
                <img
                  src={displayCoverImage}
                  alt="Live Cover Preview"
                  className="preview-card-cover-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="preview-card-gradient" />
                <span className="preview-visibility-tag">
                  {visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>

              <div className="preview-card-body">
                <h3 className="preview-trip-title">
                  {name.trim() || 'Where will your next adventure take you?'}
                </h3>

                <div className="preview-meta-row">
                  <MapPin size={14} className="preview-icon text-blue-600" />
                  <span>{selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Destination not selected'}</span>
                </div>

                <div className="preview-meta-row">
                  <Calendar size={14} className="preview-icon text-slate-400" />
                  <span>{formatDateRange()}</span>
                </div>

                {budgetAmount && (
                  <div className="preview-budget-badge">
                    <DollarSign size={13} />
                    <span>Planned: {currency} {Number(budgetAmount).toLocaleString()}</span>
                  </div>
                )}

                {description && (
                  <p className="preview-description-text">
                    "{description}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DESTINATION RECOMMENDATIONS & SUGGESTIONS */}
      <div className="suggestions-section-container">
        <div className="suggestions-header">
          <h2 className="suggestions-title">
            Suggestions for Places & Activities
          </h2>
          <p className="suggestions-subtitle">
            {selectedCity 
              ? `Recommended experiences in ${selectedCity.name}` 
              : 'Choose a destination to see recommended activities'}
          </p>
        </div>

        {selectedCity ? (
          suggestionsLoading ? (
            <div className="suggestions-loading-skeleton">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="suggestions-grid">
              {suggestions.map((activity) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  onViewDetails={() => alert(`Activity Details: ${activity.name}\n\nCost: ₹${activity.cost}\nDuration: ${activity.durationMinutes} mins`)}
                  onAdd={() => alert(`"${activity.name}" can be added directly to your itinerary builder after creating the trip.`)}
                />
              ))}
            </div>
          ) : (
            <div className="suggestions-empty-box">
              <Info size={24} className="text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-slate-700">No specific activity suggestions found for {selectedCity.name}.</p>
              <p className="text-xs text-slate-500">You will be able to search and add custom activities in the Itinerary Builder.</p>
            </div>
          )
        ) : (
          <div className="suggestions-empty-prompt">
            <Compass size={32} className="prompt-icon" />
            <h4 className="prompt-title">Choose a destination to see recommendations</h4>
            <p className="prompt-desc">Search and select a city in the trip form above to explore curated activities and attractions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
