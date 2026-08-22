import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import EditTripPage from './pages/EditTripPage';
import MyTripsPage from './pages/MyTripsPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import CitySearchPage from './pages/CitySearchPage';
import ActivitySearchPage from './pages/ActivitySearchPage';
import BudgetPage from './pages/BudgetPage';
import CalendarTimelinePage from './pages/CalendarTimelinePage';
import PublicItineraryPage from './pages/PublicItineraryPage';
import CommunityPage from './pages/CommunityPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [kpiData, setKpiData] = useState({
    totalTrips: 12,
    upcomingJourneys: 2,
    savedDestinations: 8,
    pendingProposals: 3,
  });

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Main Application Layout Routes */}
            <Route element={<MainLayout kpiData={kpiData} setKpiData={setKpiData} />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trips" element={<MyTripsPage />} />
              <Route path="/trips/create" element={<CreateTripPage />} />
              <Route path="/trips/:tripId/edit" element={<EditTripPage />} />
              <Route path="/trips/:tripId/builder" element={<ItineraryBuilderPage />} />
              <Route path="/trips/:tripId/itinerary" element={<ItineraryViewPage />} />
              <Route path="/cities" element={<CitySearchPage />} />
              <Route path="/trips/:tripId/cities" element={<CitySearchPage />} />
              <Route path="/activities" element={<ActivitySearchPage />} />
              <Route path="/trips/:tripId/activities" element={<ActivitySearchPage />} />
              <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
              <Route path="/trips/:tripId/calendar" element={<CalendarTimelinePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/public/trips/:publicId" element={<PublicItineraryPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />

              {/* Protected Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>

              {/* Status Pages */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
