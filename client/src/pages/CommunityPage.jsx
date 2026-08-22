import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Copy, 
  Eye, 
  User, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from 'lucide-react';

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);

  // Copy Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [copyTitle, setCopyTitle] = useState('');
  const [copyStartDate, setCopyStartDate] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    fetchPublicTrips();
  }, [search, sort, page]);

  const fetchPublicTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/public/trips', {
        params: { search, sort, page, limit: 9 },
      });

      if (res.data?.success) {
        setTrips(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalTrips(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch public trips');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCopyModal = (trip) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/community' } } });
      return;
    }
    setSelectedTrip(trip);
    setCopyTitle(`${trip.name} (My Version)`);
    setCopyStartDate(new Date().toISOString().split('T')[0]);
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;

    setIsCopying(true);
    try {
      const res = await api.post(`/public/trips/${selectedTrip.publicId || selectedTrip.id}/copy`, {
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

  return (
    <div className="flex flex-col gap-6 py-4 px-2 max-w-7xl mx-auto">
      {/* Community Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold inline-flex items-center gap-1.5 backdrop-blur-md">
            <Globe size={14} /> Public Itinerary Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover & Copy Community Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Browse real itineraries planned by travelers around the world. Copy any public trip into your personal account and adapt it with your own dates and budget.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search public trips..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter size={14} /> Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="startDate">Earliest Travel Date</option>
            <option value="name">Trip Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Trips Grid / Loading / Empty State */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loading message="Loading public community trips..." />
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const startDateStr = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const endDateStr = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <Card key={trip.id || trip.publicId} className="flex flex-col justify-between hover:shadow-md transition-shadow h-full">
                <div className="space-y-3">
                  {/* Cover Photo */}
                  <div className="relative h-44 -mx-5 -mt-5 mb-3 rounded-t-xl overflow-hidden bg-slate-100">
                    <img
                      src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <User size={12} /> {trip.creator}
                    </div>
                  </div>

                  {/* Header */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{trip.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={13} /> {startDateStr} – {endDateStr}
                    </p>
                  </div>

                  {/* Description */}
                  {trip.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                      <MapPin size={13} className="text-blue-600" /> {trip.destinationsCount} Destinations
                    </span>
                    {trip.budget?.amount > 0 && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-200">
                        <DollarSign size={13} /> {trip.budget.currency || 'INR'} {trip.budget.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                  <Link to={`/public/trips/${trip.publicId || trip.id}`} className="flex-1">
                    <Button variant="secondary" icon={Eye} className="w-full text-xs">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    icon={Copy}
                    className="flex-1 text-xs"
                    onClick={() => handleOpenCopyModal(trip)}
                  >
                    Copy
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No public trips found"
          description={search ? `No public itineraries matched "${search}".` : "Be the first traveler to share an itinerary with the community!"}
          actionLabel="Create a Trip"
          onAction={() => navigate('/trips/create')}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="secondary"
            icon={ChevronLeft}
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold text-slate-700">
            Page {page} of {totalPages} ({totalTrips} public trips)
          </span>
          <Button
            variant="secondary"
            icon={ChevronRight}
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Copy Modal */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Copy Public Itinerary"
      >
        <form onSubmit={handleExecuteCopy} className="space-y-4">
          <p className="text-xs text-slate-600">
            Create a personal copy of <strong>{selectedTrip?.name}</strong> in your account.
          </p>

          <Input
            label="Your Trip Title"
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
              {isCopying ? 'Copying...' : 'Copy Trip'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
