import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateEvent } from './pages/CreateEvent';
import { MatchingResults } from './pages/MatchingResults';
import { CrewSummary } from './pages/CrewSummary';
import { WorkerDashboard } from './pages/WorkerDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Organizer Routes */}
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="/organizer/create-event" element={<CreateEvent />} />
            <Route path="/organizer/matching/:eventId" element={<MatchingResults />} />
            <Route path="/organizer/crew-summary" element={<CrewSummary />} />
            
            {/* Worker Routes */}
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
