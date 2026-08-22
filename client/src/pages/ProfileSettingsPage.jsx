import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Mail, Heart, Save } from 'lucide-react';

export default function ProfileSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile & Travel Preferences</h1>
        <p className="text-xs text-slate-500">Manage your profile details, travel style, and AI customization context</p>
      </div>

      <Card title="Personal Information">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" defaultValue="Alex" icon={User} />
            <Input label="Last Name" defaultValue="Morgan" icon={User} />
          </div>
          <Input label="Email Address" defaultValue="alex@example.com" icon={Mail} />
        </form>
      </Card>

      <Card title="AI Context & Travel Preferences" subtitle="GlobeTrotter AI uses these preferences when tailoring itineraries">
        <div className="space-y-4 text-xs mt-2">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Travel Style</label>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-semibold">Budget Traveler</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">Luxury / Premium</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">Backpacker</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Interests</label>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded-md">🍜 Food & Dining</span>
              <span className="px-3 py-1 bg-slate-100 rounded-md">⛩️ Culture & Heritage</span>
              <span className="px-3 py-1 bg-slate-100 rounded-md">📷 Photography</span>
              <span className="px-3 py-1 bg-slate-100 rounded-md">🏔️ Nature & Hiking</span>
            </div>
          </div>

          <Button variant="primary" icon={Save} className="mt-2">Save Preferences (Phase 2)</Button>
        </div>
      </Card>
    </div>
  );
}
