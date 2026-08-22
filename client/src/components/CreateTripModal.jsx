import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Globe, 
  Sparkles, 
  Check, 
  Compass, 
  Clock, 
  Tag,
  ChevronRight,
  Flame
} from 'lucide-react';
import './Modals.css';

const SUGGESTED_DESTINATIONS = [
  {
    id: 'japan',
    country: 'Japan',
    title: 'Tokyo & Kyoto Cultural Tour',
    cities: 'Tokyo, Kyoto, Osaka',
    category: 'Culture',
    badge: 'Popular',
    badgeColor: 'orange',
    duration: '10 Days',
    estBudget: '₹85,000',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    description: 'Historic temples, cherry blossoms, modern metropolis & sushi.'
  },
  {
    id: 'france',
    country: 'France',
    title: 'Parisian Romance & Riviera',
    cities: 'Paris, Nice, Lyon',
    category: 'Romance',
    badge: 'Top Rated',
    badgeColor: 'blue',
    duration: '8 Days',
    estBudget: '₹1,15,000',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'Eiffel Tower, Louvre Museum, wine tasting & azure coasts.'
  },
  {
    id: 'indonesia',
    country: 'Indonesia',
    title: 'Bali Wellness & Beach Escape',
    cities: 'Ubud, Seminyak, Nusa Penida',
    category: 'Beach',
    badge: 'Trending',
    badgeColor: 'green',
    duration: '7 Days',
    estBudget: '₹45,000',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    description: 'Lush rice terraces, island hopping, surf beaches & wellness.'
  },
  {
    id: 'italy',
    country: 'Italy',
    title: 'Italian Riviera & Historic Rome',
    cities: 'Rome, Florence, Venice, Amalfi',
    category: 'Culture',
    badge: 'Featured',
    badgeColor: 'purple',
    duration: '12 Days',
    estBudget: '₹1,30,000',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Colosseum, Tuscan vineyards, gondola rides & gelatos.'
  },
  {
    id: 'switzerland',
    country: 'Switzerland',
    title: 'Swiss Alps & Glacier Express',
    cities: 'Zurich, Lucerne, Interlaken',
    category: 'Nature',
    badge: 'Scenic',
    badgeColor: 'red',
    duration: '9 Days',
    estBudget: '₹1,55,000',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
    description: 'Snowy alpine peaks, crystal lakes & panoramic train rides.'
  },
  {
    id: 'greece',
    country: 'Greece',
    title: 'Santorini Sunset & Island Hopping',
    cities: 'Athens, Santorini, Mykonos',
    category: 'Beach',
    badge: 'Best View',
    badgeColor: 'teal',
    duration: '8 Days',
    estBudget: '₹95,000',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
    description: 'White-washed villas, caldera sunsets & ancient heritage.'
  }
];

export default function CreateTripModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    destination: 'Japan',
  });
  
  const [selectedDestId, setSelectedDestId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Popular', 'Culture', 'Beach', 'Romance', 'Nature'];

  const filteredDestinations = SUGGESTED_DESTINATIONS.filter(item => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Popular') return item.badge === 'Popular' || item.badge === 'Trending';
    return item.category === activeCategory;
  });

  const handleSelectSuggestion = (dest) => {
    setSelectedDestId(dest.id);
    
    // Calculate default dates (starting 14 days from now)
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    const days = parseInt(dest.duration) || 7;
    end.setDate(end.getDate() + days);

    const formatDate = (d) => d.toISOString().split('T')[0];

    setFormData({
      name: dest.title,
      destination: dest.country,
      startDate: formatDate(start),
      endDate: formatDate(end),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData);
    setFormData({ name: '', startDate: '', endDate: '', destination: 'Japan' });
    setSelectedDestId(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container create-trip-modal-wide" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge navy">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <div>
              <h2>Plan New Journey</h2>
              <p>Pick a suggested destination or customize your trip below</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Suggested Destinations Section */}
        <div className="suggestions-section">
          <div className="suggestions-header-row">
            <div className="suggestions-title-pill">
              <Compass size={14} />
              <span>Suggested Destinations</span>
            </div>
            
            {/* Category Filter Pills */}
            <div className="category-filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="suggestions-cards-grid custom-scrollbar">
            {filteredDestinations.map((dest) => {
              const isSelected = selectedDestId === dest.id;
              return (
                <div
                  key={dest.id}
                  className={`suggestion-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectSuggestion(dest)}
                >
                  <div className="suggestion-card-img-wrapper">
                    <img src={dest.image} alt={dest.title} className="suggestion-card-img" />
                    <span className={`suggestion-badge badge-${dest.badgeColor}`}>
                      {dest.badge}
                    </span>
                    {isSelected && (
                      <div className="selected-check-badge">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  
                  <div className="suggestion-card-body">
                    <div className="suggestion-card-header">
                      <h4 className="suggestion-card-title">{dest.title}</h4>
                    </div>
                    <p className="suggestion-cities">
                      <MapPin size={12} className="inline-icon" /> {dest.cities}
                    </p>

                    <div className="suggestion-card-footer">
                      <span className="suggestion-meta">
                        <Clock size={12} /> {dest.duration}
                      </span>
                      <span className="suggestion-budget">{dest.estBudget}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-divider">
          <span>Or Enter Custom Trip Details</span>
        </div>

        {/* Custom Form Section */}
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
                <option value="Greece">Greece (Athens, Santorini)</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Sparkles size={16} />
              <span>Create Journey</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
