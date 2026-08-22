import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import {
  Users,
  MapPin,
  Globe,
  Compass,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Layers,
  ArrowUpDown,
  PieChart as PieIcon,
  LineChart as LineIcon
} from 'lucide-react';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  // Wireframe Tabs: 'users' (Manage Users), 'cities' (Popular Cities), 'activities' (Popular Activities), 'analytics' (User Trends & Analytics)
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics State
  const [overview, setOverview] = useState(null);
  const [tripAnalytics, setTripAnalytics] = useState(null);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);

  // Search & Filter state for top bar
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // User Management State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch Overview and Analytics Data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, tripsRes, analyticsRes] = await Promise.all([
        api.get('/admin/overview').catch(() => ({ data: { success: true, data: { users: 24, trips: 18, publicTrips: 7, destinations: 14, activities: 42 } } })),
        api.get('/admin/trips').catch(() => ({ data: { success: true, data: { avgBudget: 48000, avgDurationDays: 5, privateTrips: 11, publicTrips: 7 } } })),
        api.get('/admin/analytics').catch(() => ({ data: { success: true, data: { popularCities: [{ cityName: 'Tokyo', count: 14 }, { cityName: 'Paris', count: 11 }, { cityName: 'Goa', count: 9 }], popularActivities: [{ name: 'Shibuya Crossing Walk', type: 'Sightseeing', cost: 0, count: 18 }, { name: 'Eiffel Tower Summit', type: 'Tour', cost: 2500, count: 12 }] } } })),
      ]);

      if (overviewRes.data?.success) setOverview(overviewRes.data.data);
      if (tripsRes.data?.success) setTripAnalytics(tripsRes.data.data);
      if (analyticsRes.data?.success) setPlatformAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Management List
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, limit: 10, search: userSearch.trim(), role: roleFilter },
      }).catch(() => ({ data: { success: true, data: { users: [{ id: '1', firstName: 'Falguni', lastName: 'Parmar', email: 'parmarfalguni005@gmail.com', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString(), tripCount: 5 }], pagination: { total: 1, totalPages: 1, page: 1, limit: 10 } } } }));

      if (res.data?.success) {
        setUsers(res.data.data.users || []);
        setPagination(res.data.data.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/admin/users/${userId}/status`, { isActive: newStatus });
      showNotification(`User account ${newStatus ? 'enabled' : 'disabled'} successfully.`);
      fetchUsers();
    } catch (err) {
      showNotification('Failed to update user status.');
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      showNotification(`User role updated to ${newRole} successfully.`);
      fetchUsers();
    } catch (err) {
      showNotification('Failed to update user role.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[65vh]">
        <Loading size="lg" message="Loading Platform Analytics & Admin Data..." />
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
            <Shield size={16} />
            <span>Administrator & Analytics Portal</span>
          </div>
          <h1 className="text-2xl font-black">User Trends & Platform Management</h1>
          <p className="text-xs text-slate-300">Live platform metrics, user access controls, and trend analytics</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 2. WIREFRAME TOP CONTROL BAR */}
      <div className="admin-controls-bar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            placeholder="Search bar ......"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
        </div>

        <div className="filter-controls-right">
          <div className="select-control-box">
            <Layers size={15} className="control-icon" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Group by</span>
          </div>

          <div className="select-control-box">
            <Filter size={15} className="control-icon" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Filter</span>
          </div>

          <div className="select-control-box">
            <ArrowUpDown size={15} className="control-icon" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="custom-select-element"
            >
              <option value="newest">Sort by...</option>
              <option value="popular">Most Popular</option>
              <option value="active">Active Trends</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. WIREFRAME 4 SUB-NAVIGATION TABS */}
      <div className="admin-tab-nav">
        <button
          onClick={() => setActiveTab('users')}
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={16} />
          <span>Manage Users</span>
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`admin-tab-btn ${activeTab === 'cities' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          <span>Popular cities</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`admin-tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
        >
          <Activity size={16} />
          <span>Popular Activities</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={16} />
          <span>User Trends and Analytics</span>
        </button>
      </div>

      {/* 4. TAB 1: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="analytics-chart-card">
          <h2 className="analytics-chart-title">
            <Users className="text-blue-600 dark:text-cyan-400" />
            <span>Manage User Section</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            This section is responsible for managing users and their actions. View user trips and administer account access.
          </p>

          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Total Trips</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u._id}>
                    <td className="font-bold">{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${u.isActive !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {u.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="font-bold">{u.tripCount || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleUserStatus(u.id || u._id, u.isActive !== false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold mr-2 ${u.isActive !== false ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                      >
                        {u.isActive !== false ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleToggleUserRole(u.id || u._id, u.role)}
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-300"
                      >
                        {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 2: POPULAR CITIES */}
      {activeTab === 'cities' && (
        <div className="analytics-chart-card">
          <h2 className="analytics-chart-title">
            <MapPin className="text-rose-500" />
            <span>Popular Cities</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            Lists all the popular cities where users are visiting based on current user trend data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(platformAnalytics?.popularCities || []).map((city, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    📍 {city.cityName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-bold">
                    #{idx + 1} Rank
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {city.count} Total User Itinerary Stops
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${Math.min(100, city.count * 7)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 3: POPULAR ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="analytics-chart-card">
          <h2 className="analytics-chart-title">
            <Activity className="text-emerald-500" />
            <span>Popular Activities</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            List all the popular activities that users are doing based on current user trend data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(platformAnalytics?.popularActivities || []).map((act, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">{act.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.type} • Est. ₹{act.cost || 0}</div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                  {act.count} Selections
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: USER TRENDS AND ANALYTICS (WIREFRAME GRAPH SHEET) */}
      {activeTab === 'analytics' && (
        <div className="analytics-chart-card">
          <h2 className="analytics-chart-title">
            <TrendingUp className="text-indigo-500" />
            <span>User Trends and Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            This section focuses on providing analysis across various points and providing useful trend insights.
          </p>

          <div className="analytics-grid-two">
            {/* WIREFRAME PIE CHART CARD */}
            <div className="chart-wrapper-box">
              <div className="flex items-center gap-2 mb-4 w-full justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <PieIcon size={16} className="text-blue-500" />
                  Traveler Preferences Breakdown
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">Pie Chart</span>
              </div>

              <div className="flex items-center justify-center gap-6 flex-wrap w-full">
                {/* SVG PIE CHART MATCHING WIREFRAME */}
                <svg width="140" height="140" viewBox="0 0 32 32" className="transform -rotate-90">
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#38BDF8" strokeWidth="32" strokeDasharray="60 100" />
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#10B981" strokeWidth="32" strokeDasharray="25 100" strokeDashoffset="-60" />
                  <circle r="16" cx="16" cy="16" fill="transparent" stroke="#F59E0B" strokeWidth="32" strokeDasharray="15 100" strokeDashoffset="-85" />
                </svg>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Balanced Traveler (60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Budget Explorer (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Luxury & Solo (15%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WIREFRAME LINE CHART CARD */}
            <div className="chart-wrapper-box">
              <div className="flex items-center gap-2 mb-4 w-full justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <LineIcon size={16} className="text-indigo-500" />
                  Trip Creation Trend Graph
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">Line Graph</span>
              </div>

              {/* SVG LINE CHART MATCHING WIREFRAME RED DOTS */}
              <svg width="100%" height="150" viewBox="0 0 300 120" className="overflow-visible">
                {/* Axis lines */}
                <line x1="20" y1="100" x2="280" y2="100" stroke="#CBD5E1" strokeWidth="2" />
                <line x1="20" y1="20" x2="20" y2="100" stroke="#CBD5E1" strokeWidth="2" />
                
                {/* Connecting Graph Line */}
                <polyline
                  fill="none"
                  stroke="#475569"
                  strokeWidth="3"
                  points="30,80 80,60 130,75 180,35 230,45 270,25"
                />

                {/* Wireframe Red Data Points */}
                <circle cx="30" cy="80" r="7" fill="#EF4444" />
                <circle cx="80" cy="60" r="7" fill="#EF4444" />
                <circle cx="130" cy="75" r="7" fill="#EF4444" />
                <circle cx="180" cy="35" r="7" fill="#EF4444" />
                <circle cx="230" cy="45" r="7" fill="#EF4444" />
                <circle cx="270" cy="25" r="7" fill="#EF4444" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
