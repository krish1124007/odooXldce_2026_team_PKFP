import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card title="Join GlobeTrotter" subtitle="Create your account to start planning AI-powered journeys">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="Alex" icon={User} required />
            <Input label="Last Name" placeholder="Morgan" icon={User} required />
          </div>
          <Input label="Email Address" type="email" placeholder="you@example.com" icon={Mail} required />
          <Input label="Password" type="password" placeholder="••••••••" icon={Lock} required />
          <Input label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} required />
          <Button variant="primary" icon={UserPlus} className="w-full mt-2">
            Create Account (Phase 2 Placeholder)
          </Button>
          <div className="text-center text-xs text-gray-500 mt-2">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
