import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DollarSign, Sparkles, PieChart, TrendingDown } from 'lucide-react';

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trip Budget & Cost Analytics</h1>
          <p className="text-xs text-slate-500">Deterministic cost calculations and budget breakdown</p>
        </div>
        <Button variant="primary" icon={Sparkles}>✨ Make Trip Cheaper (Phase 6)</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Estimated Total"><div className="text-2xl font-black text-slate-900">₹72,400</div></Card>
        <Card title="Budget Limit"><div className="text-2xl font-black text-slate-900">₹80,000</div></Card>
        <Card title="Remaining Budget"><div className="text-2xl font-black text-emerald-600">₹7,600</div></Card>
        <Card title="Average Cost / Day"><div className="text-2xl font-black text-slate-900">₹7,240</div></Card>
      </div>

      {/* Category Breakdown Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Expense Category Breakdown">
          <div className="space-y-3 mt-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span>🚆 Transport (Shinkansen & Flights)</span><span className="font-bold">₹35,000</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span>🏨 Accommodation / Stay</span><span className="font-bold">₹22,000</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span>🎟️ Activities & Attractions</span><span className="font-bold">₹8,400</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span>🍜 Meals & Dining</span><span className="font-bold">₹7,000</span></div>
          </div>
        </Card>

        <Card title="✨ AI Budget Optimization Proposal">
          <p className="text-xs text-slate-500 mb-3">GlobeTrotter AI can scan for cheaper attraction passes and alternative train routes.</p>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
            "Swap 2 individual bullet train tickets for a 7-Day JR Pass to save ~₹6,500."
          </div>
          <Button variant="secondary" size="sm" className="mt-3">Apply Savings (Phase 6)</Button>
        </Card>
      </div>
    </div>
  );
}
