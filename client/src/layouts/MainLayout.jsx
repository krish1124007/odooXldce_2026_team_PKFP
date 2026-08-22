import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CreateTripModal from '../components/CreateTripModal';
import ReportsModal from '../components/ReportsModal';
import SearchModal from '../components/SearchModal';
import GlobeTrotterAI from '../components/ai/GlobeTrotterAI';
import { Bot, Sparkles } from 'lucide-react';

export default function MainLayout({ kpiData, setKpiData }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');

  // Modals state
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // AI Agent State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiContext, setAiContext] = useState({ page: 'dashboard' });

  const navigate = useNavigate();
  const location = useLocation();

  // Extract page and tripId from path
  const getAiContextFromPath = (path) => {
    const tripMatch = path.match(/\/trips\/([a-zA-Z0-9]+)/);
    const tripId = tripMatch && tripMatch[1] !== 'create' ? tripMatch[1] : undefined;

    if (path.includes('/builder') || path.includes('/itinerary')) {
      return { page: 'itinerary', tripId };
    }
    if (path.includes('/budget')) {
      return { page: 'budget', tripId };
    }
    if (path.includes('/cities')) {
      return { page: 'cities', tripId };
    }
    if (path.includes('/activities')) {
      return { page: 'activities', tripId };
    }
    return { page: 'dashboard', tripId };
  };

  const openAIWithContext = (customCtx = {}) => {
    const pathCtx = getAiContextFromPath(location.pathname);
    setAiContext({ ...pathCtx, ...customCtx });
    setIsAIOpen(true);
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  function getActiveTabFromPath(path) {
    if (path.includes('/admin')) return 'Admin Dashboard';
    if (path.includes('/trips/create')) return 'Plan New Trip';
    if (path.includes('/cities')) return 'City Discovery';
    if (path.includes('/activities')) return 'Activity Discovery';
    if (path.includes('/builder')) return 'Itinerary Builder';
    if (path.includes('/itinerary')) return 'Itinerary View';
    if (path.includes('/calendar')) return 'Timeline';
    if (path.includes('/budget')) return 'Trip Budget';
    if (path.includes('/community')) return 'Community';
    if (path.includes('/public')) return 'Public Trips';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/trips')) return 'My Trips';
    return 'Dashboard';
  }

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
      case 'Home':
        navigate('/');
        break;
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Admin Dashboard':
        navigate('/admin');
        break;
      case 'My Trips':
        navigate('/trips');
        break;
      case 'Plan New Trip':
        navigate('/trips/create');
        break;
      case 'City Discovery':
        navigate('/cities');
        break;
      case 'Activity Discovery':
        navigate('/activities');
        break;
      case 'Itinerary Builder':
        navigate('/trips');
        break;
      case 'Itinerary View':
        navigate('/trips');
        break;
      case 'Timeline':
        navigate('/trips');
        break;
      case 'Trip Budget':
        navigate('/trips');
        break;
      case 'Public Trips':
      case 'Community':
        navigate('/community');
        break;
      case 'Profile':
        navigate('/profile');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="app-container relative">
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
      />

      {/* Main Right Section */}
      <div className="main-wrapper">
        <Header 
          theme={theme}
          setTheme={setTheme}
          onSearchClick={() => setIsSearchOpen(true)}
        />

        <main className="main-content">
          <Outlet context={{ 
            setIsCreateTripOpen, 
            setIsAddEmployeeOpen: setIsCreateTripOpen,
            setIsReportsOpen, 
            setIsSearchOpen,
            openAIWithContext,
            kpiData
          }} />
        </main>
      </div>

      {/* Floating AI Agent Trigger Button */}
      {!isAIOpen && (
        <button
          onClick={() => openAIWithContext()}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 flex items-center space-x-2 border border-cyan-400/30 animate-bounce"
          title="Open GlobeTrotter AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
          <span>GlobeTrotter AI</span>
        </button>
      )}

      {/* GlobeTrotter AI Drawer Component */}
      <GlobeTrotterAI
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        context={aiContext}
      />

      {/* Modals */}
      <CreateTripModal 
        isOpen={isCreateTripOpen} 
        onClose={() => setIsCreateTripOpen(false)}
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
