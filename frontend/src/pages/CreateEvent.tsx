import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EventRole } from '../types';

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eventType, setEventType] = useState('Wedding');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('Pune');
  const [budget, setBudget] = useState(100000);
  const [roles, setRoles] = useState<EventRole[]>([
    { id: '1', roleName: 'Photographer', quantityNeeded: 2 }
  ]);
  const [nlInput, setNlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddRole = () => {
    setRoles([...roles, { id: Math.random().toString(), roleName: 'Security', quantityNeeded: 1 }]);
  };

  const handleRemoveRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const handleUpdateRole = (id: string, field: 'roleName' | 'quantityNeeded', value: string | number) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAIParsing = () => {
    if (nlInput.toLowerCase().includes('wedding')) {
      setEventType('Wedding');
      setBudget(150000);
      setRoles([
        { id: '1', roleName: 'Photographer', quantityNeeded: 2 },
        { id: '2', roleName: 'Videographer', quantityNeeded: 1 },
        { id: '3', roleName: 'Sound Engineer', quantityNeeded: 1 },
      ]);
      alert("AI successfully parsed your requirements!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.token) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          event_type: eventType,
          date: date,
          time: '10:00', // Hardcoded for MVP simplicity
          location: location,
          latitude: 18.5204, // Default Pune lat
          longitude: 73.8567, // Default Pune lon
          proximity_radius: 15.0,
          budget: budget,
          roles: roles.map(r => ({
            role_name: r.roleName,
            quantity_needed: r.quantityNeeded
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to create event");
      const data = await response.json();
      
      navigate(`/organizer/matching/${data.event_id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Event</h1>
      
      {/* AI Parsing Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Wand2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">AI Requirement Parser</h2>
        </div>
        <p className="text-sm text-blue-800 mb-4">Describe your event naturally, and we'll fill out the details for you.</p>
        <div className="flex space-x-4">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="e.g. I need a wedding crew for 500 guests in Pune tomorrow, budget 1.5 lakh..."
            className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="button"
            onClick={handleAIParsing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Parse
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Wedding</option>
              <option>Corporate</option>
              <option>Concert</option>
              <option>Birthday</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location / City</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Required Roles</h3>
            <button
              type="button"
              onClick={handleAddRole}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <select
                    value={role.roleName}
                    onChange={(e) => handleUpdateRole(role.id, 'roleName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Photographer</option>
                    <option>Videographer</option>
                    <option>Sound Engineer</option>
                    <option>Security</option>
                    <option>Decorator</option>
                    <option>Emcee</option>
                    <option>Catering</option>
                  </select>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    min="1"
                    value={role.quantityNeeded}
                    onChange={(e) => handleUpdateRole(role.id, 'quantityNeeded', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Processing...' : 'Find My Crew'}
          </button>
        </div>
      </form>
    </div>
  );
};
