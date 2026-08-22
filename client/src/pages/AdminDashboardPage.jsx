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
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics State
  const [overview, setOverview] = useState(null);
  const [tripAnalytics, setTripAnalytics] = useState(null);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [aiAnalytics, setAiAnalytics] = useState(null);

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
      const [overviewRes, tripsRes, analyticsRes, aiRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/trips'),
        api.get('/admin/analytics'),
        api.get('/admin/ai-analytics'),
      ]);

      if (overviewRes.data?.success) setOverview(overviewRes.data.data);
      if (tripsRes.data?.success) setTripAnalytics(tripsRes.data.data);
      if (analyticsRes.data?.success) setPlatformAnalytics(analyticsRes.data.data);
      if (aiRes.data?.success) setAiAnalytics(aiRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard analytics:', err);
      setError(err.response?.data?.message || 'Failed to load admin analytics. Please ensure you have ADMIN privileges.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Management List
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          page,
          limit: 10,
          search: userSearch.trim(),
          role: roleFilter,
        },
      });

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Toggle User Active Status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await api.patch(`/admin/users/${userId}/status`, { isActive: newStatus });
      if (res.data?.success) {
        showNotification(`User account ${newStatus ? 'enabled' : 'disabled'} successfully.`);
        fetchUsers();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Update User Role
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        showNotification(`User role updated to ${newRole} successfully.`);
        fetchUsers();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[65vh]">
        <Loading size="lg" message="Loading Platform Analytics & Admin Data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle size={40} className="text-red-500" />
        <h2 className="text-xl font-bold">Admin Authorization Error</h2>
        <p className="text-sm max-w-md text-center">{error}</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
          Retry Request
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-blue-400 font-semibold text-xs uppercase tracking-wider">
            <Shield size={16} />
            <span>Administrator Portal</span>
          </div>
          <h1 className="text-2xl font-black">Platform Analytics & Management</h1>
          <p className="text-xs text-slate-300">Deterministic MongoDB metrics, user access controls, and AI monitoring</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'trips', label: 'Trips & Destinations', icon: MapPin },
          { id: 'ai', label: 'AI Agent Performance', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 6 Deterministic KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold">Total Users</span>
                <Users size={18} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.users?.toLocaleString() || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold">Total Trips</span>
                <Compass size={18} className="text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.trips?.toLocaleString() || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold">Public Trips</span>
                <Globe size={18} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.publicTrips?.toLocaleString() || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold">Destinations</span>
                <MapPin size={18} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.destinations?.toLocaleString() || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold">Activities</span>
                <Activity size={18} className="text-rose-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{overview?.activities?.toLocaleString() || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold">AI Operations</span>
                <Sparkles size={18} className="text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-600">{overview?.aiRequests?.toLocaleString() || 0}</div>
            </div>
          </div>

          {/* User Growth & Platform Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="User Registration Growth (Last 30 Days)">
              {platformAnalytics?.userGrowth?.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {platformAnalytics.userGrowth.slice(0, 7).map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                      <span className="font-medium text-slate-700">{item._id}</span>
                      <span className="font-bold bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                        +{item.users} New Users
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-4 text-center">No registration growth data recorded in past 30 days.</p>
              )}
            </Card>

            <Card title="Trip Creation Metrics">
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-xs font-semibold text-blue-700">Avg Trip Budget</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">₹{tripAnalytics?.avgBudget?.toLocaleString() || 0}</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-700">Avg Trip Duration</div>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">{tripAnalytics?.avgDurationDays || 0} Days</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="text-xs font-semibold text-purple-700">Private Trips</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{tripAnalytics?.privateTrips || 0}</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-xs font-semibold text-amber-700">Public Shared Trips</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">{tripAnalytics?.publicTrips || 0}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {/* Controls: Search & Role Filter */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
                Search
              </button>
            </form>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="USER">User Role</option>
                <option value="ADMIN">Admin Role</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          {usersLoading ? (
            <div className="p-8 flex justify-center">
              <Loading size="md" message="Loading users..." />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No users found matching query criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Trips</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                            u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.isActive !== false ? <UserCheck size={12} /> : <UserX size={12} />}
                          {u.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-slate-700">{u.tripCount || 0}</td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserStatus(u._id || u.id, u.isActive !== false)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            u.isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleToggleUserRole(u._id || u.id, u.role)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} Total Users)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIPS & DESTINATIONS */}
      {activeTab === 'trips' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Top Popular Destinations (From Trip Stops)">
            {platformAnalytics?.popularCities?.length > 0 ? (
              <div className="space-y-2 mt-2">
                {platformAnalytics.popularCities.map((city, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500" />
                      {city.cityName}
                    </span>
                    <span className="font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                      {city.count} {city.count === 1 ? 'Trip Stop' : 'Trip Stops'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No trip destination stops recorded yet.</p>
            )}
          </Card>

          <Card title="Most Selected Activities (From Itineraries)">
            {platformAnalytics?.popularActivities?.length > 0 ? (
              <div className="space-y-2 mt-2">
                {platformAnalytics.popularActivities.map((act, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{act.name}</div>
                      <div className="text-[10px] text-slate-500">{act.type} • ₹{act.cost}</div>
                    </div>
                    <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      {act.count} Selections
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No itinerary activity selections recorded yet.</p>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: AI AGENT PERFORMANCE */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Total AI Requests</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{aiAnalytics?.totalRequests || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Success Rate</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{aiAnalytics?.successRate || 100}%</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Avg Response Time</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{aiAnalytics?.avgResponseTimeSec || 1.8}s</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Avg Tool Calls / Request</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{aiAnalytics?.avgToolsPerRequest || 2.5}</div>
            </div>
          </div>

          <Card title="AI Agent Daily Traffic & Accuracy">
            {aiAnalytics?.dailyRequests?.length > 0 ? (
              <div className="space-y-3 mt-2">
                {aiAnalytics.dailyRequests.map((day) => (
                  <div key={day._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                    <span className="font-medium text-slate-700">{day._id}</span>
                    <div className="flex gap-4">
                      <span className="text-slate-600 font-semibold">{day.count} Total Operations</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        {day.successful} Successful
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No AI usage metrics logged in the past week.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
