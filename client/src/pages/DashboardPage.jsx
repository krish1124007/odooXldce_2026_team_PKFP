import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import KpiCards from '../components/KpiCards';
import WeeklyAttendanceChart from '../components/WeeklyAttendanceChart';
import BirthdaysWidget from '../components/BirthdaysWidget';
import '../App.css';

export default function DashboardPage() {
  const { setIsAddEmployeeOpen, setIsReportsOpen, kpiData } = useOutletContext();

  return (
    <>
      {/* Hero Banner Section */}
      <HeroBanner 
        onAddEmployee={() => setIsAddEmployeeOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
      />

      {/* Top 4 KPI Metrics */}
      <KpiCards kpiData={kpiData} />

      {/* Main Content Grid: Attendance Chart (Left) & Birthdays/Leaves (Right) */}
      <div className="dashboard-grid">
        <div className="grid-column chart-column">
          <WeeklyAttendanceChart />
        </div>
        <div className="grid-column widget-column">
          <BirthdaysWidget />
        </div>
      </div>
    </>
  );
}
