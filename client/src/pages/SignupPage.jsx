import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="max-w-md mx-auto py-12 px-4">
      <Card title="Join GlobeTrotter" subtitle="Create your account to start planning AI-powered journeys">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="First Name" 
              placeholder="Alex" 
              icon={User} 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
            />
            <Input 
              label="Last Name" 
              placeholder="Morgan" 
              icon={User} 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
            />
          </div>

          <Input 
            label="Email Address" 
            type="email" 
            placeholder="you@example.com" 
            icon={Mail} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />

          <Input 
            label="Password" 
            type="password" 
            placeholder="•••••••• (Min 6 chars)" 
            icon={Lock} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <Input 
            label="Confirm Password" 
            type="password" 
            placeholder="••••••••" 
            icon={Lock} 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />

          <Button 
            variant="primary" 
            icon={UserPlus} 
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center text-xs text-gray-500 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
