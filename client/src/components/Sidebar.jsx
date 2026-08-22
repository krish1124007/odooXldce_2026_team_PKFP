import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Map, 
  PlusCircle, 
  Compass, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Globe, 
  User as UserIcon, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  LogOut,
  Edit3,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ collapsed, setCollapsed, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState({
    Itinerary: true,
    Explore: true,
    Finances: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Traveler';
  const displayEmail = user ? user.email : '';
  const initial = user?.firstName?.[0] || 'T';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-badge">
            <span className="logo-text-d1">G</span>
            <span className="logo-text-d2">T</span>
          </div>
          {!collapsed && <span className="brand-name">GlobeTrotter</span>}
        </div>
        <button 
          className="collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Sidebar Navigation Body */}
      <div className="sidebar-nav custom-scrollbar">
        {/* MAIN SECTION */}
        <div className="nav-group">
          {!collapsed && <div className="group-title">MAIN</div>}
          
          <button 
            className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dashboard')}
          >
            <LayoutGrid size={18} className="item-icon" />
            {!collapsed && <span>Dashboard</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'My Trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('My Trips')}
          >
            <Map size={18} className="item-icon" />
            {!collapsed && <span>My Trips</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'Plan New Trip' ? 'active' : ''}`}
            onClick={() => setActiveTab('Plan New Trip')}
          >
            <PlusCircle size={18} className="item-icon" />
            {!collapsed && <span>Plan New Trip</span>}
          </button>
        </div>

        {/* EXPLORE SECTION */}
        <div className="nav-group">
          {!collapsed && <div className="group-title">EXPLORE</div>}

          <div className="accordion-group">
            <button 
              className="accordion-header"
              onClick={() => toggleSection('Explore')}
            >
              <div className="header-left">
                <Compass size={18} className="item-icon" />
                {!collapsed && <span>Discovery</span>}
              </div>
              {!collapsed && (
                openSections.Explore ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </button>

            {(!collapsed && openSections.Explore) && (
              <div className="sub-menu">
                <button 
                  className={`sub-item ${activeTab === 'City Discovery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('City Discovery')}
                >
                  <Compass size={16} className="sub-icon" />
                  <span>City Discovery</span>
                </button>
                <button 
                  className={`sub-item ${activeTab === 'Activity Discovery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Activity Discovery')}
                >
                  <Sparkles size={16} className="sub-icon" />
                  <span>Activity Discovery</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ITINERARY SECTION */}
        <div className="nav-group">
          {!collapsed && <div className="group-title">ITINERARY</div>}

          <div className="accordion-group">
            <button 
              className="accordion-header"
              onClick={() => toggleSection('Itinerary')}
            >
              <div className="header-left">
                <Calendar size={18} className="item-icon" />
                {!collapsed && <span>Itinerary</span>}
              </div>
              {!collapsed && (
                openSections.Itinerary ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </button>

            {(!collapsed && openSections.Itinerary) && (
              <div className="sub-menu">
                <button 
                  className={`sub-item ${activeTab === 'Itinerary Builder' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Itinerary Builder')}
                >
                  <Edit3 size={16} className="sub-icon" />
                  <span>Itinerary Builder</span>
                </button>
                <button 
                  className={`sub-item ${activeTab === 'Itinerary View' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Itinerary View')}
                >
                  <Eye size={16} className="sub-icon" />
                  <span>Itinerary View</span>
                </button>
                <button 
                  className={`sub-item ${activeTab === 'Timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Timeline')}
                >
                  <Calendar size={16} className="sub-icon" />
                  <span>Calendar Timeline</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FINANCES SECTION */}
        <div className="nav-group">
          {!collapsed && <div className="group-title">FINANCES</div>}

          <button 
            className={`nav-item ${activeTab === 'Trip Budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('Trip Budget')}
          >
            <DollarSign size={18} className="item-icon" />
            {!collapsed && <span>Trip Budget</span>}
          </button>
        </div>

        {/* COMMUNITY SECTION */}
        <div className="nav-group">
          {!collapsed && <div className="group-title">COMMUNITY</div>}

          <button 
            className={`nav-item ${activeTab === 'Public Trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('Public Trips')}
          >
            <Globe size={18} className="item-icon" />
            {!collapsed && <span>Public Trips</span>}
          </button>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="nav-group">
          {!collapsed && <div className="group-title">ACCOUNT</div>}

          <button 
            className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('Profile')}
          >
            <UserIcon size={18} className="item-icon" />
            {!collapsed && <span>Profile & Preferences</span>}
          </button>
        </div>
      </div>

      {/* Sidebar Footer User Profile */}
      <div className="sidebar-footer">
        <div className="profile-container">
          <div className="avatar-wrapper">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={displayName} className="avatar-img w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="avatar">{initial}</div>
            )}
            <span className="online-indicator"></span>
          </div>

          {!collapsed && (
            <div className="user-info">
              <div className="name-row">
                <span className="user-name truncate max-w-[110px]" title={displayName}>{displayName}</span>
                <span className="role-badge">{user?.role === 'ADMIN' ? 'Admin' : 'Traveler'}</span>
              </div>
              <span className="user-email truncate max-w-[130px]" title={displayEmail}>{displayEmail}</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button className="logout-btn" title="Logout" onClick={logout}>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
