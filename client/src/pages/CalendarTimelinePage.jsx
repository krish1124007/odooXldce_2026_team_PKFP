import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Calendar, Clock, AlertTriangle, Sparkles } from 'lucide-react';

export default function CalendarTimelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trip Calendar & Timeline</h1>
          <p className="text-xs text-slate-500">Day-by-day visual schedule and automatic conflict detection</p>
        </div>
        <Button variant="outline" icon={Sparkles}>✨ Auto-Resolve Schedule Conflicts</Button>
      </div>

      <Card title="Interactive Schedule Timeline (Phase 4 Drag-and-Drop)">
        <div className="space-y-3 mt-2">
          <div className="p-3 border-l-4 border-blue-600 bg-slate-50 rounded-r-lg flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900">09:00 AM - 11:30 AM</span>
              <p className="text-slate-500">Senso-ji Temple & Asakusa Walking Tour</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">Tokyo</span>
          </div>

          <div className="p-3 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <div>
                <span className="font-bold text-amber-900">11:00 AM - 01:00 PM (Overlap Detected)</span>
                <p className="text-amber-700">Tokyo Skytree Observation Deck</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Fix Overlap (Phase 4)</Button>
          </div>

          <div className="p-3 border-l-4 border-emerald-600 bg-slate-50 rounded-r-lg flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900">06:00 PM - 09:00 PM</span>
              <p className="text-slate-500">Shinjuku Foodie Night Market</p>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold">Tokyo</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
