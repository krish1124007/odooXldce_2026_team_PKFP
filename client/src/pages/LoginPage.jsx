import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card title="Welcome Back to GlobeTrotter" subtitle="Log in to access your personalized travel itineraries">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 mt-2">
          <Input label="Email Address" type="email" placeholder="you@example.com" icon={Mail} required />
          <Input label="Password" type="password" placeholder="••••••••" icon={Lock} required />
          <Button variant="primary" icon={LogIn} className="w-full mt-2">
            Log In (Phase 2 Placeholder)
          </Button>
          <div className="text-center text-xs text-gray-500 mt-2">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
