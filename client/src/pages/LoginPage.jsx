import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, LogIn, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="max-w-md mx-auto py-12 px-4">
      {!showForgotPassword ? (
        <Card title="Welcome Back to GlobeTrotter" subtitle="Log in to access your personalized travel itineraries">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com" 
              icon={Mail} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            <div>
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                icon={Lock} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotPassword(true);
                    setForgotFeedback(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button 
              variant="primary" 
              icon={LogIn} 
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="text-center text-xs text-gray-500 mt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="Reset Password" subtitle="Enter your email address to receive password recovery steps">
          {forgotFeedback && (
            <div className={`mb-4 p-3 rounded-lg border text-xs flex items-start gap-2 ${
              forgotFeedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {forgotFeedback.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
              )}
              <span>{forgotFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4 mt-2">
            <Input 
              label="Registered Email" 
              type="email" 
              placeholder="you@example.com" 
              icon={Mail} 
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required 
            />

            <Button 
              variant="primary" 
              icon={KeyRound} 
              className="w-full mt-2"
              disabled={forgotSubmitting}
            >
              {forgotSubmitting ? 'Sending Request...' : 'Send Reset Link'}
            </Button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 mt-2 font-medium"
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
