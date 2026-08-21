import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateEvent } from './pages/CreateEvent';
import { MatchingResults } from './pages/MatchingResults';
import { CrewSummary } from './pages/CrewSummary';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { LiveEventDashboard } from './pages/LiveEventDashboard';
import { OrganizerLayout } from './components/layout/OrganizerLayout';
import { Placeholder } from './pages/Placeholder';
import { OrganizerProfile } from './pages/OrganizerProfile';
import { OrganizerEvents } from './pages/OrganizerEvents';
import { OrganizerCrew } from './pages/OrganizerCrew';

// Layout for pages with Navbar
const PublicLayout = () => (
  <div className="min-h-screen bg-slate-50 font-sans">
    <Navbar />
    <Outlet />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
          </Route>
          
          {/* Organizer Routes */}
          <Route element={<OrganizerLayout />}>
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="/organizer/create-event" element={<CreateEvent />} />
            <Route path="/organizer/matching/:eventId" element={<MatchingResults />} />
            <Route path="/organizer/crew-summary/:eventId" element={<CrewSummary />} />
            <Route path="/organizer/live/:eventId" element={<LiveEventDashboard />} />
            
            {/* Placeholder routes for incomplete pages */}
            <Route path="/organizer/events" element={<OrganizerEvents />} />
            <Route path="/organizer/crew" element={<OrganizerCrew />} />
            <Route path="/organizer/notifications" element={<Placeholder />} />
            <Route path="/organizer/profile" element={<OrganizerProfile />} />
          </Route>
          
          {/* Worker Routes - Can add WorkerLayout later */}
          <Route element={<PublicLayout />}>
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
