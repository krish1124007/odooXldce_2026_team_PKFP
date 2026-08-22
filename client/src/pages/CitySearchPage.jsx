import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Search, MapPin, Plus, Sparkles } from 'lucide-react';

export default function CitySearchPage() {
  const cities = [
    { name: 'Tokyo', country: 'Japan', costIndex: '$$$', popularity: '9.8 / 10' },
    { name: 'Kyoto', country: 'Japan', costIndex: '$$', popularity: '9.5 / 10' },
    { name: 'Osaka', country: 'Japan', costIndex: '$$', popularity: '9.3 / 10' },
    { name: 'Sapporo', country: 'Japan', costIndex: '$$', popularity: '8.9 / 10' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">City Discovery</h1>
          <p className="text-xs text-slate-500">Discover cities and add stops to your trip itinerary</p>
        </div>
        <Button variant="outline" icon={Sparkles}>✨ AI City Recommendations</Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search city by name or country..." icon={Search} className="flex-1" />
        <Button variant="primary">Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cities.map((city) => (
          <Card key={city.name} title={city.name} subtitle={`${city.country} • Cost: ${city.costIndex}`}>
            <div className="mt-2 text-xs text-slate-500">Popularity Score: {city.popularity}</div>
            <Button variant="secondary" size="sm" icon={Plus} className="w-full mt-3">Add to Trip (Phase 3)</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
