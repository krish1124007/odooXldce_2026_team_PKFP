import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, MoreVertical, Eye, Edit, Share2, Trash2, ArrowRight, AlertTriangle, X } from 'lucide-react';
import api from '../services/api';
import './TripCard.css';

const TripCard = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = (start, end) => {
    if (!start) return 'Dates set';
    if (!end) return formatDate(start);
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ONGOING':
        return <span className="trip-badge status-ongoing">● Ongoing</span>;
      case 'UPCOMING':
        return <span className="trip-badge status-upcoming">Upcoming</span>;
      case 'COMPLETED':
        return <span className="trip-badge status-completed">Completed</span>;
      default:
        return <span className="trip-badge status-draft">Draft</span>;
    }
  };

  // Format destination preview names (e.g. Tokyo · Kyoto · Osaka)
  const getDestinationPreview = () => {
    if (!trip.destinations || trip.destinations.length === 0) {
      return null;
    }
    const names = trip.destinations.map((d) => (typeof d === 'object' ? d.name : d)).filter(Boolean);
    if (names.length === 0) return null;
    if (names.length <= 3) {
      return names.join(' · ');
    }
    return `${names.slice(0, 3).join(' · ')} +${names.length - 3}`;
  };

  const handleShare = async () => {
    setMenuOpen(false);
    try {
      if (trip.visibility === 'PUBLIC' && trip.publicId) {
        const url = `${window.location.origin}/public/trips/${trip.publicId}`;
        await navigator.clipboard.writeText(url);
        alert(`Public share link copied to clipboard!\n${url}`);
      } else {
        const res = await api.put(`/trips/${trip._id}/publish`);
        if (res.data?.success) {
          const url = `${window.location.origin}${res.data.data.publicUrl || `/public/trips/${trip._id}`}`;
          await navigator.clipboard.writeText(url);
          alert(`Trip published to Community!\nPublic link copied:\n${url}`);
        }
      }
    } catch (err) {
      alert('Failed to copy public link.');
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(trip._id, trip.name);
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="trip-card-container group">
        {/* Cover Image Header */}
        <div className="trip-card-image-box">
          <img
            src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.name}
            className="trip-card-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="trip-card-overlay-gradient" />

          {/* Top Status & Three Dot Menu */}
          <div className="trip-card-top-tags">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getStatusBadge(trip.status)}
              {(trip.isCopiedFromPublic || trip.originalPublicId || trip.name?.toLowerCase().includes('(my version)') || trip.name?.toLowerCase().includes('(copy)')) && (
                <span className="trip-badge bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xs">
                  🌐 Saved from Community
                </span>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition-all border border-slate-700/50"
                title="Trip options"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs font-semibold text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/trips/${trip._id}/builder`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Eye size={14} className="text-blue-600 dark:text-cyan-400" />
                    <span>View Trip</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/trips/${trip._id}/edit`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit size={14} className="text-slate-600 dark:text-slate-400" />
                    <span>Edit Trip</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Share2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Share Trip</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Delete Trip</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="trip-card-title-box">
            <h3 className="trip-card-name capitalize">
              {trip.name}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="trip-card-body-content">
          {/* Destination Preview List */}
          {getDestinationPreview() && (
            <div className="text-xs font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5 truncate">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{getDestinationPreview()}</span>
            </div>
          )}

          {trip.description && (
            <p className="trip-card-desc">{trip.description}</p>
          )}

          {/* Meta rows */}
          <div className="trip-card-meta-list">
            <div className="meta-row">
              <Calendar size={14} className="meta-icon-blue" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>

            <div className="meta-row">
              <MapPin size={14} className="meta-icon-blue" />
              <span>
                {trip.destinations?.length || 0} destination
                {trip.destinations?.length === 1 ? '' : 's'}
              </span>
            </div>

            {trip.budget?.amount > 0 && (
              <div className="meta-row">
                <DollarSign size={14} className="meta-icon-green" />
                <span>₹{trip.budget.amount.toLocaleString()} budget</span>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="trip-card-footer-bar pt-3">
            <div className="text-xs text-slate-500 font-medium">
              {trip.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
            </div>

            <Link
              to={`/trips/${trip._id}/builder`}
              className="btn-view-trip-link"
            >
              <span>View Trip</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Modal Confirmation Dialog */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete Trip?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                This will permanently remove <strong>"{trip.name}"</strong> and its associated itinerary, stops, activities, and budget records.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Trip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TripCard;
