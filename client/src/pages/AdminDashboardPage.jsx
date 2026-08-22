import React from 'react';
import Card from '../components/ui/Card';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin & Analytics Dashboard</h1>
        <p className="text-xs text-slate-500">Platform-wide usage metrics, active trips, and database statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Users"><div className="text-2xl font-black text-slate-900">1,248</div></Card>
        <Card title="Total Trips"><div className="text-2xl font-black text-slate-900">3,890</div></Card>
        <Card title="Public Shared Trips"><div className="text-2xl font-black text-slate-900">920</div></Card>
        <Card title="AI Operations"><div className="text-2xl font-black text-blue-600">14,250</div></Card>
      </div>

      <Card title="Top Destination Cities">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2 bg-slate-50 rounded"><span>1. Tokyo, Japan</span><span className="font-bold">1,120 Trips</span></div>
          <div className="flex justify-between p-2 bg-slate-50 rounded"><span>2. Paris, France</span><span className="font-bold">890 Trips</span></div>
          <div className="flex justify-between p-2 bg-slate-50 rounded"><span>3. Kyoto, Japan</span><span className="font-bold">750 Trips</span></div>
        </div>
      </Card>
    </div>
  );
}
