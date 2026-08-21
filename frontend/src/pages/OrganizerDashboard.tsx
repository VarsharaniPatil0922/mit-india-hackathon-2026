import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, MapPin, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/organizer/dashboard`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
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
                <Link
                  to={`/organizer/matching/${event.id}`}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap"
                >
                  Manage Crew
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
