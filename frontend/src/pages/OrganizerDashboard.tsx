import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  
  // Mock events for the dashboard
  const mockEvents = [
    {
      id: 'e1',
      title: 'Grand Wedding in Pune',
      date: '2026-08-25',
      status: 'matching',
      budget: 100000,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizer Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your events and crews.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Event</span>
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Your Events</h2>
        </div>
        
        {mockEvents.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {mockEvents.map(event => (
              <li key={event.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-500">Date: {event.date} • Budget: ₹{event.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {event.status === 'matching' ? 'Finding Crew' : event.status}
                    </span>
                    <Link
                      to={`/organizer/matching/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Crew Results &rarr;
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">You don't have any events yet.</p>
            <Link
              to="/organizer/create-event"
              className="text-blue-600 font-medium hover:underline"
            >
              Create your first event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
