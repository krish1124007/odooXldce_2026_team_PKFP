import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import './Modals.css';

export default function ReportsModal({ isOpen, onClose }) {
  const [promptText, setPromptText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPromptText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge blue">
              <Sparkles size={20} />
            </div>
            <div>
              <h2>GlobeTrotter AI Assistant</h2>
              <p>Ask AI to build, optimize, or adjust your travel itinerary</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Describe your travel request</label>
            <div className="input-with-icon">
              <Sparkles size={16} className="input-icon" />
              <input
                type="text"
                placeholder="e.g. 'Make my Japan trip 2 days shorter and under ₹70,000'"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                required
              />
            </div>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>AI Proposal generated! (Will be activated in Phase 6)</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Send size={15} />
              <span>Ask GlobeTrotter AI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
