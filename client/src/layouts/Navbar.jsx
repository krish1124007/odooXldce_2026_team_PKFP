import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Compass, LayoutDashboard, Map, User, ShieldAlert, PlusCircle } from 'lucide-react';
import './layout.css';

export default function Navbar() {
  return (
    <header className="gt-navbar">
      <div className="gt-navbar-container">
        {/* Brand Logo */}
        <Link to="/dashboard" className="gt-brand">
          <div className="gt-brand-logo">
            <Compass size={22} className="text-white" />
          </div>
          <div className="gt-brand-text">
            <span className="gt-brand-title">GlobeTrotter</span>
            <span className="gt-brand-badge">AI Platform</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="gt-nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `gt-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/trips" className={({ isActive }) => `gt-nav-item ${isActive ? 'active' : ''}`}>
            <Map size={16} />
            <span>My Trips</span>
          </NavLink>

          <NavLink to="/trips/create" className={({ isActive }) => `gt-nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={16} />
            <span>Plan Trip</span>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `gt-nav-item ${isActive ? 'active' : ''}`}>
            <User size={16} />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/admin" className={({ isActive }) => `gt-nav-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={16} />
            <span>Admin</span>
          </NavLink>
        </nav>

        {/* Auth / Profile Actions Placeholder */}
        <div className="gt-navbar-actions">
          <Link to="/login" className="gt-auth-btn login">Log In</Link>
          <Link to="/signup" className="gt-auth-btn signup">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
