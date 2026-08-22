import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import './WeeklyAttendanceChart.css';

const travelBudgetData = [
  { name: 'Mon', transport: 2, stay: 4, activities: 2 },
  { name: 'Tue', transport: 12, stay: 3, activities: 2 },
  { name: 'Wed', transport: 14, stay: 3, activities: 1 },
  { name: 'Thu', transport: 10, stay: 5, activities: 1 },
  { name: 'Fri', transport: 13, stay: 4, activities: 1 },
  { name: 'Sat', transport: 13, stay: 3, activities: 1 },
  { name: 'Sun', transport: 1, stay: 1, activities: 2 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-title">{label} Budget Breakdown (₹ in thousands)</p>
        <div className="tooltip-item">
          <span className="dot navy"></span>
          <span>Transport & Flights: ₹{payload[0]?.value || 0},000</span>
        </div>
        <div className="tooltip-item">
          <span className="dot orange"></span>
          <span>Stay & Hotels: ₹{payload[1]?.value || 0},000</span>
        </div>
        <div className="tooltip-item">
          <span className="dot blue"></span>
          <span>Activities & Dining: ₹{payload[2]?.value || 0},000</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function WeeklyAttendanceChart() {
  return (
    <div className="dashboard-card chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Weekly Travel Expenses Allocation</h3>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={travelBudgetData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#E2E8F0" 
            />
            <YAxis 
              domain={[0, 20]} 
              ticks={[0, 5, 10, 15, 20]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 13 }}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 13 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
            
            <Bar 
              dataKey="transport" 
              stackId="a" 
              fill="#122244" 
              radius={[0, 0, 0, 0]} 
            />
            <Bar 
              dataKey="stay" 
              stackId="a" 
              fill="#EFA00B" 
              radius={[0, 0, 0, 0]} 
            />
            <Bar 
              dataKey="activities" 
              stackId="a" 
              fill="#2A9DF4" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
