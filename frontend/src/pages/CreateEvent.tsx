import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowRight, ArrowLeft, Briefcase, MapPin, Calendar, Clock, Sparkles, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventsApi } from '../services/api';

type RoleReq = { id: string, name: string, count: number, isCustom: boolean };

const SUGGESTED_ROLES = [
  'Photographer',
  'Videographer',
  'Sound Engineer',
  'Security',
  'Decorator',
  'Emcee / Anchor',
  'Catering',
  'Electrician',
  'Cleaning Crew',
  'Usher'
];

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  // Step 1: Details
  const [eventType, setEventType] = useState('Wedding');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  
  // Step 2: Requirements
  const [budget, setBudget] = useState(50000);
  const [roles, setRoles] = useState<RoleReq[]>([
    { id: '1', name: 'Photographer', count: 2, isCustom: false },
    { id: '2', name: 'Security', count: 3, isCustom: false }
  ]);
  const [roleError, setRoleError] = useState('');

  // Step 3: Preferences
  const [proximity, setProximity] = useState(15);
  const [priorities, setPriorities] = useState({
    budget: 80,
    reliability: 90,
    rating: 85,
  });

  const handleRoleCount = (id: string, delta: number) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        const newCount = Math.max(1, Math.min(50, r.count + delta));
        return { ...r, count: newCount };
      }
      return r;
    }));
  };

  const addRole = () => {
    setRoles([...roles, { id: Math.random().toString(), name: '', count: 1, isCustom: false }]);
  };

  const validateRoles = () => {
    setRoleError('');
    if (roles.length === 0) {
      setRoleError('At least 1 role must be added.');
      return false;
    }
    
    const seen = new Set<string>();
    
    for (const r of roles) {
      const trimmedName = r.name.trim();
      if (!trimmedName) {
        setRoleError('All roles must have a name. Please fill or delete empty roles.');
        return false;
      }
      if (r.count < 1) {
        setRoleError('Quantity must be at least 1 for all roles.');
        return false;
      }
      
      const lowerName = trimmedName.toLowerCase();
      if (seen.has(lowerName)) {
        setRoleError(`This role is already added: "${trimmedName}". You can increase its quantity instead.`);
        return false;
      }
      seen.add(lowerName);
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!validateRoles()) return;
    }
    setStep(step + 1);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.token) {
      setRoleError("You must be logged in to create an event.");
      return;
    }
    
    // Default end time to 4 hours after start time
    let endTime = time;
    if (time) {
      const [hours, mins] = time.split(':');
      const endHours = (parseInt(hours) + 4) % 24;
      endTime = `${endHours.toString().padStart(2, '0')}:${mins}`;
    }

    const payload = {
      event_type: eventType.toLowerCase(),
      event_date: date,
      start_time: time,
      end_time: endTime,
      location: location,
      latitude: 18.5204,
      longitude: 73.8567,
      proximity_radius: proximity,
      budget: budget,
      roles: roles.map(r => ({
        role_name: r.name.trim(),
        quantity_needed: r.count
      }))
    };
    
    setIsLoading(true);
    setRoleError('');
    try {
      const response = await eventsApi.createEvent(payload, user.token);
      navigate(`/organizer/matching/${response.event_id}`);
    } catch (err: any) {
      setRoleError(err.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Event Details', 'Requirements', 'Preferences', 'Crew'];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10"></div>
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isPast = step > stepNum;
            return (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                  isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 
                  isPast ? 'bg-indigo-100 border-indigo-600 text-indigo-600' : 
                  'bg-white border-slate-300 text-slate-400'
                }`}>
                  {stepNum}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10">
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Event Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white font-medium"
                  >
                    <option>Wedding</option>
                    <option>Corporate</option>
                    <option>Concert</option>
                    <option>Birthday</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pune, MH"
                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Event Requirements</h2>
            
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Budget (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-medium">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 text-lg font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <label className="block text-lg font-bold text-slate-800">Required Roles</label>
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Total Workers: {roles.reduce((acc, r) => acc + r.count, 0)}
                </div>
              </div>
              
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      
                      {/* Role Input */}
                      <div className="flex-1 w-full flex flex-col gap-2">
                        <select 
                          value={role.isCustom ? 'Custom Role' : (SUGGESTED_ROLES.includes(role.name) ? role.name : (role.name ? 'Custom Role' : ''))}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Custom Role') {
                              setRoles(roles.map(r => r.id === role.id ? { ...r, name: '', isCustom: true } : r));
                            } else {
                              setRoles(roles.map(r => r.id === role.id ? { ...r, name: val, isCustom: false } : r));
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                        >
                          <option value="" disabled>Select a role...</option>
                          {SUGGESTED_ROLES.map(sr => (
                            <option key={sr} value={sr}>{sr}</option>
                          ))}
                          <option value="Custom Role">✨ Custom Role...</option>
                        </select>
                        
                        {role.isCustom && (
                          <input 
                            type="text" 
                            placeholder="Enter custom role name (e.g. Stage Manager)"
                            value={role.name}
                            onChange={(e) => setRoles(roles.map(r => r.id === role.id ? { ...r, name: e.target.value } : r))}
                            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-800 bg-white"
                            autoFocus
                          />
                        )}
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity</span>
                           <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                             <button 
                               type="button"
                               onClick={() => handleRoleCount(role.id, -1)}
                               className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all disabled:opacity-50"
                               disabled={role.count <= 1}
                             >
                               <Minus className="w-4 h-4" />
                             </button>
                             <span className="w-8 text-center font-bold text-slate-900">{role.count}</span>
                             <button 
                               type="button"
                               onClick={() => handleRoleCount(role.id, 1)}
                               className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all disabled:opacity-50"
                               disabled={role.count >= 50}
                             >
                               <Plus className="w-4 h-4" />
                             </button>
                           </div>
                        </div>

                        <button 
                          type="button"
                          onClick={() => setRoles(roles.filter(r => r.id !== role.id))}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>

              {roleError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{roleError}</span>
                </div>
              )}

              <button 
                type="button"
                onClick={addRole}
                className="mt-6 w-full flex items-center justify-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 px-4 py-3 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              >
                <Plus className="w-5 h-5" /> Add Another Role
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Matching Preferences</h2>
            <p className="text-slate-500 mb-8">Fine-tune how the AI optimizes your crew selection.</p>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Proximity Radius</label>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{proximity} km</span>
                </div>
                <input 
                  type="range" min="5" max="50" step="5"
                  value={proximity} onChange={(e) => setProximity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Budget Priority</label>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{priorities.budget}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={priorities.budget} onChange={(e) => setPriorities({...priorities, budget: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Reliability Priority</label>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{priorities.reliability}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={priorities.reliability} onChange={(e) => setPriorities({...priorities, reliability: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Rating Priority</label>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{priorities.rating}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={priorities.rating} onChange={(e) => setPriorities({...priorities, rating: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-colors ${
              step === 1 ? 'invisible' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
              {isLoading ? 'Creating Event...' : 'Find Optimal Crew'} 
              {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
