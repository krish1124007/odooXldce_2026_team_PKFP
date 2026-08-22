import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
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
  Sparkles 
} from 'lucide-react';
import './CreateTripPage.css';

export default function CreateTripPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [visibility, setVisibility] = useState('PRIVATE');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('Budget amount cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        startDate,
        endDate,
        coverPhoto: coverPhoto.trim() || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        budget: {
          amount: Number(budgetAmount) || 0,
          currency,
        },
        visibility,
      };

      const res = await api.post('/trips', payload);
      if (res.data && res.data.success) {
        const newTripId = res.data.data._id;
        navigate(`/trips/${newTripId}/builder`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="create-trip-page-container">
      {/* Navigation link */}
      <Link to="/trips" className="back-link-btn">
        <ArrowLeft size={16} />
        <span>Back to My Trips</span>
      </Link>

      {/* Main Form Card */}
      <div className="create-trip-form-card">
        <div className="form-card-header">
          <div className="badge-pill-cyan">
            <Sparkles size={14} />
            <span>Trip Creation</span>
          </div>
          <h1 className="form-card-title">Create New Trip</h1>
          <p className="form-card-subtitle">
            Set up your trip schedule, cover photo, and planned travel budget
          </p>
        </div>

        {error && (
          <div className="error-alert-banner">
            <AlertCircle size={16} className="error-alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-trip-form-body">
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
                placeholder="e.g. Japan Autumn Adventure 2026"
                className="input-field-element"
              />
            </div>
          </div>

          {/* Dates Grid */}
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
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field-element"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-input-group">
            <label className="input-field-label">Description</label>
            <div className="input-field-wrapper textarea-wrapper">
              <FileText size={16} className="input-field-icon textarea-icon" />
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview or goal for this trip..."
                className="input-field-element textarea-element"
              />
            </div>
          </div>

          {/* Cover Photo URL */}
          <div className="form-input-group">
            <label className="input-field-label">Cover Image URL</label>
            <div className="input-field-wrapper">
              <ImageIcon size={16} className="input-field-icon" />
              <input
                type="url"
                value={coverPhoto}
                onChange={(e) => setCoverPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="input-field-element"
              />
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

          {/* Form Actions */}
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
    </div>
  );
}
