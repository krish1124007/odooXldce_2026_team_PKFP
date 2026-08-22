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
  Layers,
  ArrowUpDown,
  List,
  Grid,
  Sparkles
} from 'lucide-react';
import './CommunityPage.css';

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [groupBy, setGroupBy] = useState('ALL'); // 'ALL', 'POPULAR'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('feed'); // 'feed' (Wireframe list) or 'grid'
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
    <div className="community-page-container">
      {/* Community Hero Banner */}
      <div className="community-hero-banner">
        <span className="community-hero-badge">
          <Globe size={13} /> Public Itinerary Marketplace
        </span>
        <h1 className="community-hero-title">
          Discover & Copy Community Itineraries
        </h1>
        <p className="community-hero-subtitle">
          Browse real itineraries planned by travelers around the world. Copy any public trip into your personal account and adapt it with your own dates and budget.
        </p>
      </div>

      {/* Wireframe Top Control Bar: Search, Group By, Filter, Sort By */}
      <div className="community-controls-bar">
        {/* Search */}
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            placeholder="Search public trips or destinations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input-field"
          />
        </div>

        <div className="filter-controls-right">
          {/* Group By */}
          <div className="select-control-box">
            <Layers size={15} className="control-icon" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="custom-select-element"
              title="Group By"
            >
              <option value="ALL">Group: All Trips</option>
              <option value="POPULAR">Group: Popular Trips</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="select-control-box">
            <ArrowUpDown size={15} className="control-icon" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="custom-select-element"
              title="Sort By"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="startDate">Earliest Date</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="select-control-box p-1">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'feed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Feed / List View"
            >
              <List size={14} />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trips Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loading message="Loading public community trips..." />
        </div>
      ) : trips.length > 0 ? (
        viewMode === 'feed' ? (
          /* WIREFRAME LIST / FEED VIEW (Avatar Circle + Horizontal Post Card) */
          <div className="space-y-6">
            {trips.map((trip) => {
              const startDateStr = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const endDateStr = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const cleanCreator = trip.creator ? trip.creator.replace(/^planned by\s+/i, '') : 'Traveler';
              const creatorInitial = cleanCreator ? cleanCreator[0].toUpperCase() : 'P';

              return (
                <div key={trip.id || trip.publicId} className="community-feed-item">
                  {/* Wireframe User Avatar Circle */}
                  <div className="community-user-avatar" title={`Planned by ${cleanCreator}`}>
                    {creatorInitial}
                  </div>

                  {/* Horizontal Post Card */}
                  <div className="community-post-card horizontal">
                    <div className="community-post-img-side">
                      <img
                        src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                        alt={trip.name}
                        className="community-post-img"
                      />
                    </div>

                    <div className="community-post-content">
                      <div className="community-post-header">
                        <div className="community-author-row">
                          <User size={13} className="text-blue-600 dark:text-cyan-400" />
                          <span>Planned by <strong>{cleanCreator}</strong></span>
                        </div>
                        <h3 className="community-trip-title">{trip.name}</h3>
                        <p className="community-trip-dates">
                          <Calendar size={13} /> {startDateStr} – {endDateStr}
                        </p>
                        {trip.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {trip.description}
                          </p>
                        )}
                        <div className="community-trip-meta-row">
                          <span className="meta-pill">
                            <MapPin size={13} className="text-blue-600" /> {trip.destinationsCount} Destinations
                          </span>
                          {trip.budget?.amount > 0 && (
                            <span className="meta-pill budget">
                              💰 {trip.budget.currency || 'INR'} {trip.budget.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="community-actions-row">
                        <Link to={`/public/trips/${trip.publicId || trip.id}`} className="flex-1">
                          <button className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 w-full">
                            <Eye size={14} />
                            <span>View Itinerary</span>
                          </button>
                        </Link>
                        <button
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 flex-1"
                          onClick={() => handleOpenCopyModal(trip)}
                        >
                          <Copy size={14} />
                          <span>Copy Trip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW MODE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const startDateStr = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const endDateStr = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <Card key={trip.id || trip.publicId} className="flex flex-col justify-between hover:shadow-md transition-shadow h-full">
                  <div className="space-y-3">
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

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{trip.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={13} /> {startDateStr} – {endDateStr}
                      </p>
                    </div>

                    {trip.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <MapPin size={13} className="text-blue-600" /> {trip.destinationsCount} Destinations
                      </span>
                      {trip.budget?.amount > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <DollarSign size={13} /> {trip.budget.currency || 'INR'} {trip.budget.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
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
        )
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
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
          <p className="text-xs text-slate-600 dark:text-slate-400">
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

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
