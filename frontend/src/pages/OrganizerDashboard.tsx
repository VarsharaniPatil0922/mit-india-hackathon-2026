import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, MapPin, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export const OrganizerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/organizer/dashboard`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (response.status === 401) {
          logout();
          navigate('/');
          return;
        }
        if (!response.ok) {
          const errText = await response.text();
          console.error("API Error Response:", errText);
          throw new Error(`Failed to fetch dashboard data: HTTP ${response.status} - ${errText}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.token) fetchDashboard();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const stats = [
    { label: 'Active Events', value: data?.active_events || '0', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Confirmed Crew', value: data?.total_workers_hired || '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Responses', value: data?.completed_events || '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Budget Utilization', value: `${data?.budget_utilization || 0}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const recentEvents = data?.recent_events || [];
  const demoEvent = recentEvents.find((e: any) => e.title.includes("MIT National Hackathon"));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {user?.name || 'Organizer'}
          </h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your events today.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Demo Banner */}
      {import.meta.env.VITE_DEMO_MODE === 'true' && demoEvent && (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-widest mb-4 inline-block">DEMO EVENT</span>
            <h2 className="text-3xl font-black mb-2">AI CREW OPTIMIZATION READY</h2>
            <p className="text-indigo-200 mb-8 max-w-2xl text-lg">
              {demoEvent.title} has been seeded with realistic data. The backend matching engine has successfully evaluated candidates based on proximity, skills, budget, and reliability.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Evaluated</p>
                <p className="text-2xl font-black">18 Workers</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Required</p>
                <p className="text-2xl font-black">8 Crew</p>
              </div>
              <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Status</p>
                <p className="text-xl font-bold text-emerald-100">8 PRIMARY CREW</p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider">Status</p>
                <p className="text-xl font-bold text-blue-100">4 BACKUPS</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex flex-col space-y-2 text-sm text-indigo-100">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-300" /> {demoEvent.date}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-300" /> {demoEvent.location}</div>
                <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-300" /> Budget: ₹{demoEvent.budget.toLocaleString()}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full md:w-auto">
                <Link
                  to={`/organizer/crew-summary/${demoEvent.id}`}
                  className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
                >
                  👁️ VIEW DEMO CREW
                </Link>
                <Link
                  to={`/organizer/matching/${demoEvent.id}`}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-500 px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
                >
                  ✨ VIEW AI MATCHING
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Recent Events</h2>
          <Link to="/organizer/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentEvents.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No events yet. Create one!</div>
          ) : recentEvents.map((event: any) => (
            <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors group flex flex-col md:flex-row gap-6 items-center">
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                  {event.title === "MIT National Hackathon Demo Event" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-700 uppercase tracking-wider border border-purple-200">
                      DEMO EVENT
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${event.statusColor}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {event.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.location}</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-slate-600">{event.type}</span>
                </div>
              </div>

              {/* Progress & Budget */}
              <div className="w-full md:w-64 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Crew Assembly</span>
                    <span className="text-slate-900 font-bold">{event.crewCompletion}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${event.crewCompletion}%` }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Budget</span>
                  <span className="font-medium text-slate-900">
                    ₹{event.spent.toLocaleString()} <span className="text-slate-400 font-normal">/ ₹{event.budget.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full md:w-auto flex justify-end pl-4">
                {event.title === "MIT National Hackathon Demo Event" ? (
                  <Link
                    to={`/organizer/matching/${event.id}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                  >
                    ✨ View AI Matching
                  </Link>
                ) : (
                  <Link
                    to={`/organizer/matching/${event.id}`}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap"
                  >
                    Manage Crew
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
