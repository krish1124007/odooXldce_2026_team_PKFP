import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Globe, Sparkles, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-container">
        {/* Left Hero Column */}
        <div className="auth-hero-column">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            alt="Travel Paradise"
            className="auth-hero-bg-img"
          />
          <div className="auth-hero-overlay-gradient" />

          <div className="auth-hero-content">
            <div className="auth-brand-logo-badge">
              <div className="logo-icon-box">GT</div>
              <div className="brand-text-wrapper">
                <span className="brand-title-lg">GlobeTrotter</span>
                <span className="brand-tagline-sm">AI Travel Platform</span>
              </div>
            </div>

            <div className="hero-message-box">
              <h1 className="hero-main-title">
                Create Your Free Travel Account
              </h1>
              <p className="hero-main-desc">
                Join thousands of travelers building multi-city itineraries, discovering activities, and managing travel budgets.
              </p>

              <div className="hero-feature-list">
                <div className="hero-feature-item">
                  <div className="hero-feature-icon"><Globe size={18} /></div>
                  <span>Instant Access to 500+ Curated Destinations</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon"><Sparkles size={18} /></div>
                  <span>Phase 4 Itinerary Engine & Conflict Detection</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon"><Compass size={18} /></div>
                  <span>Free Personal Travel Dashboard</span>
                </div>
              </div>
            </div>

            <div className="hero-footer-copy">
              © {new Date().getFullYear()} GlobeTrotter Inc. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="auth-form-column">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Join GlobeTrotter</h2>
              <p className="auth-form-sub">
                Set up your account in seconds to start planning
              </p>
            </div>

            {errorMessage && (
              <div className="auth-error-alert">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-body">
              <div className="grid grid-cols-2 gap-3">
                <div className="auth-input-group">
                  <label className="auth-label">First Name</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="auth-input-field"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Last Name</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Morgan"
                      className="auth-input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Min 6 chars)"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-submit-btn mt-2"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create Free Account</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link font-bold">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
