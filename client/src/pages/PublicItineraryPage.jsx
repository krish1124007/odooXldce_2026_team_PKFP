import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  Copy, 
  Share2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  User, 
  ArrowLeft,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function PublicItineraryPage() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trip, setTrip] = useState(null);

  // Share Link Feedback State
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Copy Trip Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyTitle, setCopyTitle] = useState('');
  const [copyStartDate, setCopyStartDate] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    fetchPublicTrip();
  }, [publicId]);

  const fetchPublicTrip = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/public/trips/${publicId}`);
      if (res.data?.success) {
        setTrip(res.data.data);
        setCopyTitle(`${res.data.data.name} (My Version)`);
        setCopyStartDate(new Date().toISOString().split('T')[0]);
      } else {
        setError(res.data?.message || 'Public trip not found.');
      }
    } catch (err) {
      setError(err.message || 'This trip is private or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip?.name || 'GlobeTrotter Itinerary',
          text: `Check out this itinerary: ${trip?.name}`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 3000);
    } catch (err) {
      alert('Link: ' + url);
    }
  };

  const handleOpenCopyModal = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/public/trips/${publicId}` } } });
      return;
    }
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = async (e) => {
    e.preventDefault();
    setIsCopying(true);
    try {
      const res = await api.post(`/public/trips/${publicId}/copy`, {
        name: copyTitle.trim(),
        startDate: copyStartDate,
      });

      if (res.data?.success && res.data?.data?._id) {
        setIsCopyModalOpen(false);
        navigate(`/trips/${res.data.data._id}/builder`);
      } else {
        alert(res.data?.message || 'Failed to copy trip.');
      }
    } catch (err) {
      alert(err.message || 'Failed to copy trip.');
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loading message="Loading public itinerary..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <Card title="Public Itinerary Unavailable">
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg mb-4 flex items-center gap-2">
            <Lock size={18} className="text-amber-600 shrink-0" />
            <span>{error || 'This itinerary is private or no longer available.'}</span>
          </div>
          <Link to="/community">
            <Button variant="primary" icon={Globe}>Explore Community Trips</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const startDateFormatted = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const endDateFormatted = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6 py-4 px-2 max-w-6xl mx-auto">
      {/* Top Banner Navigation */}
      <div className="flex justify-between items-center">
        <Link to="/community" className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold">
          <ArrowLeft size={16} /> Community Trips
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Globe size={14} /> Public Shared Itinerary
        </span>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white min-h-[220px] flex flex-col justify-end p-6 sm:p-8">
        <img
          src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md font-semibold flex items-center gap-1">
              <User size={13} /> {trip.creator.name}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md font-semibold flex items-center gap-1">
              <Calendar size={13} /> {startDateFormatted} – {endDateFormatted}
            </span>
            {trip.estimatedTotalCost > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/90 text-white font-bold flex items-center gap-1">
                <DollarSign size={13} /> Est. Cost: {trip.budget?.currency || 'INR'} {trip.estimatedTotalCost.toLocaleString()}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
            {trip.name}
          </h1>

          {trip.description && (
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed drop-shadow-xs">
              {trip.description}
            </p>
          )}

          {/* Destinations Pills */}
          {trip.destinations && trip.destinations.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {trip.destinations.map((dest) => (
                <span key={dest._id || dest.name} className="px-3 py-1 bg-white/90 text-slate-900 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <MapPin size={13} className="text-blue-600" /> {dest.name}, {dest.country}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs text-slate-600 flex items-center gap-2">
          <span>Shared public link for this itinerary</span>
          {copyFeedback && (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={14} /> Link copied!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" icon={Share2} onClick={handleShareClick} className="flex-1 sm:flex-none">
            Share Link
          </Button>
          <Button variant="primary" icon={Copy} onClick={handleOpenCopyModal} className="flex-1 sm:flex-none">
            Copy Trip to My Account
          </Button>
        </div>
      </div>

      {/* Day-by-day Public Itinerary */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Day-Wise Itinerary</span>
          <span className="text-xs font-semibold text-slate-500">({trip.stops?.length || 0} stops)</span>
        </h2>

        {trip.stops && trip.stops.length > 0 ? (
          trip.stops.map((stop, idx) => (
            <Card key={stop.id || idx}>
              <div className="flex flex-col gap-4">
                {/* Stop Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <MapPin size={16} className="text-blue-600" /> {stop.city?.name || 'City Stop'}, {stop.city?.country || ''}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(stop.startDate).toLocaleDateString()} – {new Date(stop.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                {stop.activities && stop.activities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stop.activities.map((act) => {
                      const activityObj = act.activityId || {};
                      return (
                        <div key={act._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                          {activityObj.image && (
                            <img
                              src={activityObj.image}
                              alt={activityObj.name}
                              className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-800 text-xs">{activityObj.name || 'Activity'}</h4>
                              {act.estimatedCost > 0 && (
                                <span className="text-xs font-bold text-emerald-600">
                                  {activityObj.currency || 'INR'} {act.estimatedCost.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Clock size={12} /> {act.startTime} - {act.endTime}
                              </span>
                              {activityObj.type && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[10px]">
                                  {activityObj.type}
                                </span>
                              )}
                            </div>

                            {act.notes && (
                              <p className="text-[11px] text-slate-600 italic">{act.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-2">
                    No activities listed for this stop.
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-8 text-xs text-slate-500">
              No itinerary stops defined for this public trip.
            </div>
          </Card>
        )}
      </div>

      {/* Copy Trip Modal */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Copy Trip to Your Account"
      >
        <form onSubmit={handleExecuteCopy} className="space-y-4">
          <p className="text-xs text-slate-600">
            This will create a new editable trip in your personal account with all cities, stops, and activities preserved.
          </p>

          <Input
            label="Your Trip Name"
            value={copyTitle}
            onChange={(e) => setCopyTitle(e.target.value)}
            required
          />

          <Input
            label="Your Start Date"
            type="date"
            value={copyStartDate}
            onChange={(e) => setCopyStartDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCopyModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" icon={Copy} disabled={isCopying} type="submit">
              {isCopying ? 'Copying Trip...' : 'Copy Trip'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
