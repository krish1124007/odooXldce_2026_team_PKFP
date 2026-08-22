import React, { useState } from 'react';
import { X, MapPin, Calendar, Globe } from 'lucide-react';
import './Modals.css';

export default function AddEmployeeModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    destination: 'Japan',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData);
    setFormData({ name: '', startDate: '', endDate: '', destination: 'Japan' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge navy">
              <MapPin size={20} />
            </div>
            <div>
              <h2>Plan New Journey</h2>
              <p>Create a multi-city travel itinerary on GlobeTrotter</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Trip Title</label>
            <div className="input-with-icon">
              <MapPin size={16} className="input-icon" />
              <input
                type="text"
                placeholder="e.g. Autumn Adventure in Japan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <div className="input-with-icon">
                <Calendar size={16} className="input-icon" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>End Date</label>
              <div className="input-with-icon">
                <Calendar size={16} className="input-icon" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Primary Country / Region</label>
            <div className="input-with-icon">
              <Globe size={16} className="input-icon" />
              <select
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              >
                <option value="Japan">Japan (Tokyo, Kyoto, Osaka)</option>
                <option value="France">France (Paris, Nice, Lyon)</option>
                <option value="Italy">Italy (Rome, Florence, Venice)</option>
                <option value="Indonesia">Indonesia (Bali, Ubud)</option>
                <option value="Switzerland">Switzerland (Zurich, Lucerne)</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
