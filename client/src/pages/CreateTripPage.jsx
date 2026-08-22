import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Map, Calendar, Sparkles } from 'lucide-react';

export default function CreateTripPage() {
  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card title="Plan a New Trip" subtitle="Create a multi-city travel itinerary manually or with GlobeTrotter AI">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 mt-2">
          <Input label="Trip Name" placeholder="e.g. Autumn Adventure in Japan" icon={Map} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" icon={Calendar} required />
            <Input label="End Date" type="date" icon={Calendar} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Description / Notes</label>
            <textarea
              placeholder="Describe your trip goals, pace, and preferred activities..."
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="primary" icon={Map}>Create Trip (Phase 3 Placeholder)</Button>
            <Button variant="outline" icon={Sparkles}>✨ Let AI Plan My Trip</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
