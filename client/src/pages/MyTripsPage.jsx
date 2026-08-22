import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { Plus, MapPin, Eye, Edit3 } from 'lucide-react';

export default function MyTripsPage() {
  const sampleTrips = [
    { id: 'japan-2026', name: 'Japan Culture & Food Tour', dates: 'Oct 10 - Oct 20, 2026', cities: 3, status: 'UPCOMING' },
    { id: 'europe-2026', name: 'European Grand Highlights', dates: 'Dec 01 - Dec 15, 2026', cities: 4, status: 'DRAFT' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="text-sm text-slate-500">Manage all your upcoming, draft, and completed travel plans</p>
        </div>
        <Link to="/trips/create">
          <Button variant="primary" icon={Plus}>New Trip</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleTrips.map((trip) => (
          <Card key={trip.id} title={trip.name} subtitle={`${trip.dates} • ${trip.cities} Cities`}>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                {trip.status}
              </span>
              <div className="flex gap-2">
                <Link to={`/trips/${trip.id}/itinerary`}>
                  <Button variant="secondary" size="sm" icon={Eye}>View</Button>
                </Link>
                <Link to={`/trips/${trip.id}/builder`}>
                  <Button variant="primary" size="sm" icon={Edit3}>Edit Builder</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
