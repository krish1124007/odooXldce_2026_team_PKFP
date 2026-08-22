import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Share2, Copy, Edit3, Calendar, DollarSign, MapPin } from 'lucide-react';

export default function ItineraryViewPage() {
  const { tripId } = useParams();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase">Public Trip Summary</span>
          <h1 className="text-2xl font-extrabold text-slate-900">Japan Culture & Food Tour</h1>
          <p className="text-xs text-slate-500">10 Days • 3 Cities (Tokyo, Kyoto, Osaka) • Estimated Budget: ₹85,000</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/trips/${tripId}/builder`}><Button variant="secondary" size="sm" icon={Edit3}>Edit Builder</Button></Link>
          <Link to={`/public/trips/${tripId}`}><Button variant="outline" size="sm" icon={Share2}>Share Link</Button></Link>
        </div>
      </div>

      <Card title="Day-Wise Itinerary Overview">
        <div className="space-y-4">
          <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
            <h4 className="font-bold text-sm text-slate-900">Day 1 — Tokyo (Arrival & Skytree)</h4>
            <p className="text-xs text-slate-500 mt-1">Arrival at Haneda Airport, hotel check-in, evening panoramic views at Tokyo Skytree.</p>
          </div>

          <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
            <h4 className="font-bold text-sm text-slate-900">Day 2 — Historic Asakusa & Akihabara</h4>
            <p className="text-xs text-slate-500 mt-1">Visit Senso-ji Temple, traditional tea tasting, afternoon tech district exploration.</p>
          </div>

          <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
            <h4 className="font-bold text-sm text-slate-900">Day 3 — Shinkansen to Kyoto</h4>
            <p className="text-xs text-slate-500 mt-1">Bullet train ride to Kyoto, evening Gion geisha district walk and traditional dinner.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
