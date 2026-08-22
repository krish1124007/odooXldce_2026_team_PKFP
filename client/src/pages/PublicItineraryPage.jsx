import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Copy, Share2, Sparkles, Globe } from 'lucide-react';

export default function PublicItineraryPage() {
  const { publicId } = useParams();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
            <Globe size={14} /> Shared Public Trip • ID: {publicId}
          </span>
          <h1 className="text-2xl font-extrabold mt-1">Japan Autumn Heritage & Food Experience</h1>
          <p className="text-xs text-blue-200 mt-1">Shared by @alex_traveler • 10 Days • 3 Cities</p>
        </div>
        <Button variant="secondary" icon={Copy}>Copy Trip to My Account (Phase 5)</Button>
      </div>

      <Card title="✨ Customize Shared Trip with AI">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. 'I only have 5 days and ₹50,000. Adapt this itinerary for me.'"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500"
            disabled
          />
          <Button variant="primary" icon={Sparkles}>Adapt Trip (Phase 6)</Button>
        </div>
      </Card>

      <Card title="Shared Day-Wise Plan">
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg"><strong>Day 1-3:</strong> Tokyo Highlights (Skytree, Asakusa, Senso-ji, Shinjuku)</div>
          <div className="p-3 bg-slate-50 rounded-lg"><strong>Day 4-7:</strong> Kyoto Temples & Gion District</div>
          <div className="p-3 bg-slate-50 rounded-lg"><strong>Day 8-10:</strong> Osaka Street Food & Universal Studios</div>
        </div>
      </Card>
    </div>
  );
}
