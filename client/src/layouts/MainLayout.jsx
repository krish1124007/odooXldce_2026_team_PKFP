import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddEmployeeModal from '../components/AddEmployeeModal';
import ReportsModal from '../components/ReportsModal';
import SearchModal from '../components/SearchModal';

export default function MainLayout({ kpiData, setKpiData }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');

  // Modals state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from route path
  const getActiveTabFromPath = (path) => {
    if (path.includes('/trips/create')) return 'Plan New Trip';
    if (path.includes('/trips/demo-trip-123/cities')) return 'City Discovery';
    if (path.includes('/trips/demo-trip-123/activities')) return 'Activity Discovery';
    if (path.includes('/trips/demo-trip-123/builder')) return 'Itinerary Builder';
    if (path.includes('/trips/demo-trip-123/itinerary')) return 'Itinerary View';
    if (path.includes('/trips/demo-trip-123/calendar')) return 'Timeline';
    if (path.includes('/trips/demo-trip-123/budget')) return 'Trip Budget';
    if (path.includes('/public')) return 'Public Trips';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/trips')) return 'My Trips';
    return 'Dashboard';
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const handleAddTrip = (newTrip) => {
    if (setKpiData) {
      setKpiData(prev => ({
        ...prev,
        totalTrips: (prev.totalTrips || 12) + 1
      }));
    }
  };

  const handleSelectTab = (tab) => {
    switch (tab) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'My Trips':
        navigate('/trips');
        break;
      case 'Plan New Trip':
        navigate('/trips/create');
        break;
      case 'City Discovery':
        navigate('/trips/demo-trip-123/cities');
        break;
      case 'Activity Discovery':
        navigate('/trips/demo-trip-123/activities');
        break;
      case 'Itinerary Builder':
        navigate('/trips/demo-trip-123/builder');
        break;
      case 'Itinerary View':
        navigate('/trips/demo-trip-123/itinerary');
        break;
      case 'Timeline':
        navigate('/trips/demo-trip-123/calendar');
        break;
      case 'Trip Budget':
        navigate('/trips/demo-trip-123/budget');
        break;
      case 'Public Trips':
        navigate('/public/trips/demo-public-1');
        break;
      case 'Profile':
        navigate('/profile');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="app-container">
      {/* Exact Old Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
      />

      {/* Main Right Section */}
      <div className="main-wrapper">
        {/* Exact Old Header with Search (⌘K), Theme Switcher, Notifications */}
        <Header 
          theme={theme}
          setTheme={setTheme}
          onSearchClick={() => setIsSearchOpen(true)}
        />

        {/* Dashboard Main Content */}
        <main className="main-content">
          <Outlet context={{ 
            setIsAddEmployeeOpen, 
            setIsReportsOpen, 
            setIsSearchOpen,
            kpiData
          }} />
        </main>
      </div>

      {/* Exact Old Modals */}
      <AddEmployeeModal 
        isOpen={isAddEmployeeOpen} 
        onClose={() => setIsAddEmployeeOpen(false)}
        onAdd={handleAddTrip}
      />

      <ReportsModal 
        isOpen={isReportsOpen} 
        onClose={() => setIsReportsOpen(false)}
      />

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={handleSelectTab}
      />
    </div>
  );
}
