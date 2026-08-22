import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, LogIn, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, UserCheck, Sparkles } from 'lucide-react';
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

  const handleSubmit = async (e, customEmail, customPassword) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetEmail = customEmail || email.trim();
    const targetPassword = customPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email: targetEmail, password: targetPassword });
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid email or password');
    }
  };

  const handleQuickDemoLogin = (demoEmail) => {
    const demoPass = 'Demo@12345';
    setEmail(demoEmail);
    setPassword(demoPass);
    handleSubmit(null, demoEmail, demoPass);
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
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      {!showForgotPassword ? (
        <>
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

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </Card>

          {/* Quick Demo Accounts Helper */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <UserCheck size={16} className="text-blue-600 dark:text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Quick Demo Personas (Development)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any account below to auto-fill credentials and log in instantly:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('demo@globetrotter.dev')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    👤 Alex Traveler <span className="font-normal text-[11px] text-slate-500">(Normal User)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">demo@globetrotter.dev</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">Log In →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('busy@globetrotter.dev')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    🧳 Maya Explorer <span className="font-normal text-[11px] text-slate-500">(Busy User - 12 Trips)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">busy@globetrotter.dev</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">Log In →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('empty@globetrotter.dev')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    🍃 New Traveler <span className="font-normal text-[11px] text-slate-500">(Empty State - 0 Trips)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">empty@globetrotter.dev</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">Log In →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('budget@globetrotter.dev')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    💰 Budget Traveler <span className="font-normal text-[11px] text-slate-500">(Over-Budget Edge Cases)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">budget@globetrotter.dev</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">Log In →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('creator@globetrotter.dev')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    🌟 Travel Creator <span className="font-normal text-[11px] text-slate-500">(Public Itineraries)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">creator@globetrotter.dev</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">Log In →</span>
              </button>
            </div>
          </div>
        </>
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
