import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft,
  Compass,
  Sparkles,
  Globe,
  MapPin,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState(null);

  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid email or password');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex.traveler@example.com');
    setPassword('password123');
    setIsSubmitting(true);
    const result = await login({ email: 'alex.traveler@example.com', password: 'password123' });
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Demo login failed');
    }
  };

  const handleAdminLogin = async () => {
    setEmail('admin@globetrotter.com');
    setPassword('Admin123!');
    setIsSubmitting(true);
    const result = await login({ email: 'admin@globetrotter.com', password: 'Admin123!' });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setErrorMessage(result.message || 'Admin login failed. Please sign in with an admin account.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotFeedback(null);

    if (!resetEmail.trim()) {
      setForgotFeedback({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }

    setForgotSubmitting(true);
    const res = await forgotPassword(resetEmail.trim());
    setForgotSubmitting(false);

    setForgotFeedback({
      type: 'success',
      text: res.message || 'If an account exists for this email, password reset instructions will be sent.'
    });
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-container">
        {/* Left Hero Column */}
        <div className="auth-hero-column">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
            alt="Travel Globe"
            className="auth-hero-bg-img"
          />
          <div className="auth-hero-overlay-gradient" />

          <div className="auth-hero-content">
            <div className="auth-brand-logo-badge">
              <div className="logo-icon-box">GT</div>
              <div className="brand-text-wrapper">
                <span className="brand-title-lg">GlobeTrotter</span>
                <span className="brand-tagline-sm">AI Travel Engine</span>
              </div>
            </div>

            <div className="hero-message-box">
              <h1 className="hero-main-title">
                Your Next Journey Starts Here
              </h1>
              <p className="hero-main-desc">
                Plan multi-city itineraries, budget with precision, and explore curated travel destinations across the globe.
              </p>

              <div className="hero-feature-list">
                <div className="hero-feature-item">
                  <div className="hero-feature-icon"><Globe size={18} /></div>
                  <span>500+ Curated Global Cities & Destinations</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon"><Sparkles size={18} /></div>
                  <span>Deterministic Multi-City Itinerary Engine</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon"><Compass size={18} /></div>
                  <span>Schedule Conflict Detection & Day-by-Day Timeline</span>
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
            {!showForgotPassword ? (
              <>
                <div className="auth-form-header">
                  <h2 className="auth-form-title">Welcome Back</h2>
                  <p className="auth-form-sub">
                    Log in to access your personalized travel itineraries
                  </p>
                </div>

                {/* Quick Demo Login Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={handleDemoLogin} 
                    className="demo-login-btn"
                    title="Click for instant traveler login"
                  >
                    <UserCheck size={16} />
                    <span>Traveler Login</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={handleAdminLogin} 
                    className="demo-login-btn border-indigo-300 dark:border-indigo-700 hover:border-indigo-500"
                    title="Click for instant Admin Portal login"
                  >
                    <UserCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Admin Login</span>
                  </button>
                </div>

                <div className="divider-line-box">
                  <div className="divider-line" />
                  <span className="divider-text">Or sign in with email</span>
                  <div className="divider-line" />
                </div>

                {errorMessage && (
                  <div className="auth-error-alert">
                    <AlertCircle size={16} className="shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form-body">
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
                    <div className="auth-row-between">
                      <label className="auth-label">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setShowForgotPassword(true);
                          setForgotFeedback(null);
                        }}
                        className="auth-link text-xs"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="auth-input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="auth-submit-btn"
                  >
                    {isSubmitting ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <LogIn size={16} />
                        <span>Log In</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="auth-footer-text">
                  Don't have an account yet?{' '}
                  <Link to="/signup" className="auth-link font-bold">
                    Sign up now
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="auth-form-header">
                  <h2 className="auth-form-title">Reset Password</h2>
                  <p className="auth-form-sub">
                    Enter your email address to receive password recovery instructions
                  </p>
                </div>

                {forgotFeedback && (
                  <div className={`auth-error-alert ${
                    forgotFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : ''
                  }`}>
                    {forgotFeedback.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                    )}
                    <span>{forgotFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="auth-form-body">
                  <div className="auth-input-group">
                    <label className="auth-label">Registered Email</label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="auth-input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="auth-submit-btn"
                  >
                    {forgotSubmitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <KeyRound size={16} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold mt-2"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
