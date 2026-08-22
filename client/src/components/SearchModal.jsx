import React, { useState } from 'react';
import { Search, X, Map, Compass, Calendar, DollarSign, User, ArrowRight } from 'lucide-react';
import './Modals.css';

export default function SearchModal({ isOpen, onClose, onSelectTab }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Dashboard', section: 'Main', icon: Search, tab: 'Dashboard' },
    { title: 'My Trips', section: 'Main', icon: Map, tab: 'My Trips' },
    { title: 'Plan New Trip', section: 'Main', icon: Map, tab: 'Plan New Trip' },
    { title: 'City Discovery', section: 'Explore', icon: Compass, tab: 'City Discovery' },
    { title: 'Activity Discovery', section: 'Explore', icon: Compass, tab: 'Activity Discovery' },
    { title: 'Itinerary Builder', section: 'Itinerary', icon: Calendar, tab: 'Itinerary Builder' },
    { title: 'Trip Budget', section: 'Finances', icon: DollarSign, tab: 'Trip Budget' },
    { title: 'Profile & Settings', section: 'Account', icon: User, tab: 'Profile' },
  ];

  const filteredLinks = quickLinks.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.section.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container search-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            placeholder="Search trips, cities, activities, settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="search-results custom-scrollbar">
          <div className="results-label">Quick Navigation</div>
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={item.title} 
                  className="search-result-row"
                  onClick={() => {
                    onSelectTab(item.tab);
                    onClose();
                  }}
                >
                  <div className="result-left">
                    <IconComp size={16} className="result-icon" />
                    <span className="result-title">{item.title}</span>
                    <span className="result-section">{item.section}</span>
                  </div>
                  <ArrowRight size={14} className="result-arrow" />
                </div>
              );
            })
          ) : (
            <div className="no-results">No pages or records found matching "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
