import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, MapPin, Sparkles, Move, Clock, DollarSign, Calendar, Compass } from 'lucide-react';

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-nav Header Bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400">TRIP ID: {tripId}</span>
          <h1 className="text-xl font-bold text-slate-900">Itinerary Builder</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/trips/${tripId}/cities`}><Button variant="secondary" size="sm" icon={MapPin}>Discover Cities</Button></Link>
          <Link to={`/trips/${tripId}/activities`}><Button variant="secondary" size="sm" icon={Compass}>Discover Activities</Button></Link>
          <Link to={`/trips/${tripId}/budget`}><Button variant="secondary" size="sm" icon={DollarSign}>Budget</Button></Link>
          <Link to={`/trips/${tripId}/calendar`}><Button variant="secondary" size="sm" icon={Calendar}>Timeline</Button></Link>
          <Link to={`/trips/${tripId}/itinerary`}><Button variant="primary" size="sm">View Final Itinerary</Button></Link>
        </div>
      </div>

      {/* AI Builder Assistant */}
      <Card title="✨ Let AI Build It" subtitle="Ask GlobeTrotter AI to organize cities, suggest activities, or optimize your day schedule">
        <div className="flex gap-3 mt-2">
          <input
            type="text"
            placeholder="e.g. 'Make Day 2 less hectic and suggest affordable lunch spots in Tokyo.'"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500"
            disabled
          />
          <Button variant="primary" icon={Sparkles}>Optimize Itinerary (Phase 6)</Button>
        </div>
      </Card>

      {/* Day-Wise Drag & Drop Placeholder Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Day 1: Tokyo Arrival" subtitle="Oct 10, 2026">
          <div className="flex flex-col gap-2 mt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex justify-between items-center">
              <span>🛬 Haneda Airport Transfer</span>
              <span className="text-slate-400">02:00 PM</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex justify-between items-center">
              <span>🗼 Tokyo Tower Observation</span>
              <span className="text-slate-400">05:30 PM</span>
            </div>
            <Button variant="outline" size="sm" icon={Plus} className="w-full mt-2">+ Add Activity (Phase 4)</Button>
          </div>
        </Card>

        <Card title="Day 2: Asakusa & Akihabara" subtitle="Oct 11, 2026">
          <div className="flex flex-col gap-2 mt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex justify-between items-center">
              <span>⛩️ Senso-ji Temple Walk</span>
              <span className="text-slate-400">09:00 AM</span>
            </div>
            <Button variant="outline" size="sm" icon={Plus} className="w-full mt-2">+ Add Activity (Phase 4)</Button>
          </div>
        </Card>

        <Card title="Day 3: Kyoto Bullet Train" subtitle="Oct 12, 2026">
          <div className="flex flex-col gap-2 mt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex justify-between items-center">
              <span>🚅 Shinkansen to Kyoto</span>
              <span className="text-slate-400">10:00 AM</span>
            </div>
            <Button variant="outline" size="sm" icon={Plus} className="w-full mt-2">+ Add Activity (Phase 4)</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
