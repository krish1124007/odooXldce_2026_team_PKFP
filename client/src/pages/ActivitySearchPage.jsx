import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Search, Compass, Plus, Clock, DollarSign, Sparkles } from 'lucide-react';

export default function ActivitySearchPage() {
  const activities = [
    { name: 'Senso-ji Temple & Asakusa Walking Tour', type: 'Culture', duration: '2.5 hrs', cost: '₹1,500' },
    { name: 'Tokyo Skytree Observation Deck Ticket', type: 'Sightseeing', duration: '1.5 hrs', cost: '₹2,200' },
    { name: 'Shinjuku Foodie Night Market & Ramen Tour', type: 'Food', duration: '3.0 hrs', cost: '₹3,500' },
    { name: 'Meiji Shrine & Yoyogi Park Stroll', type: 'Nature', duration: '2.0 hrs', cost: 'Free' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Discovery</h1>
          <p className="text-xs text-slate-500">Find experiences, tours, and food spots for your stops</p>
        </div>
        <Button variant="outline" icon={Sparkles}>✨ Find Activities Under ₹2,000</Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search activity in Tokyo..." icon={Search} className="flex-1" />
        <Button variant="primary">Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act) => (
          <Card key={act.name} title={act.name} subtitle={`Category: ${act.type}`}>
            <div className="flex gap-4 text-xs text-slate-500 my-2">
              <span className="flex items-center gap-1"><Clock size={14} /> {act.duration}</span>
              <span className="flex items-center gap-1"><DollarSign size={14} /> {act.cost}</span>
            </div>
            <Button variant="secondary" size="sm" icon={Plus} className="w-full mt-2">Add to Day 1 (Phase 3)</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
