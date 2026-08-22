import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, MapPin, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export const OrganizerEvents = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE}/events`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (response.status === 401) {
          logout();
          navigate('/');
          return;
        }
        if (!response.ok) {
          const errorBody = await response.text();
          console.error('API Error Response:', errorBody);
          throw new Error(`Failed to fetch events: HTTP ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        
        const mapped = data.map((e: any) => {
           return {
              id: String(e.event_id),
              title: e.event_type + " @ " + e.location,
              type: e.event_type,
              date: e.event_date,
              time: 'TBA',
              location: e.location,
              budget: e.budget,
              spent: 0,
              crewCompletion: e.status === "READY" ? 100 : 0,
              status: e.status,
              statusColor: e.status === "READY" ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
           }
        });
        setEvents(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchEvents();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading events...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Events</h1>
          <p className="text-slate-500 mt-1">Manage all your upcoming and past events.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search events by name, location, or type..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {events.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500">
             No events yet. Create one!
          </div>
        )}
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {event.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${event.statusColor}`}>
                  {event.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Date & Time</p>
                    <p className="text-sm font-medium text-slate-900">{event.date}</p>
                    <p className="text-xs text-slate-500">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
                    <p className="text-sm font-medium text-slate-900">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Progress & Budget */}
              <div className="space-y-4 bg-slate-50 rounded-xl p-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-semibold">Crew Assembly Progress</span>
                    <span className="text-slate-900 font-bold">{event.crewCompletion}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${event.crewCompletion}%` }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Budget</p>
                    <p className="font-bold text-slate-900 text-lg">
                      ₹{event.spent.toLocaleString()} 
                      <span className="text-slate-400 text-sm font-medium"> / ₹{event.budget.toLocaleString()}</span>
                    </p>
                  </div>
                  <Link
                    to={`/organizer/matching/${event.id}`}
                    className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    Manage Crew
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
