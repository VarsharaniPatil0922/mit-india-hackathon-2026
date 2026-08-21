import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Star, MapPin, ShieldCheck, IndianRupee, Mail, MoreVertical, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

type WorkerResult = {
  worker_id: number;
  full_name: string;
  skill_category: string;
  rating: number;
  reliability_score: number;
  distance_km: number;
  price: string;
  availability_slot: string;
  phone: string;
  email: string;
};

type Event = {
  event_id: number;
  event_type: string;
  location: string;
};

const SKILLS_LIST = [
  'Photographer', 'Videographer', 'Sound Engineer', 'Security', 
  'Decorator', 'Emcee', 'Catering', 'Electrician', 'Cleaning Crew', 'Usher'
];

export const OrganizerCrew = () => {
  const { user } = useAuth();
  const token = "demo-jwt-token-12345"; // Using mock token for now since Auth is mocked

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [workers, setWorkers] = useState<WorkerResult[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Filter States
  const [skills, setSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 20000});
  const [radius, setRadius] = useState<number>(25);
  const [minReliability, setMinReliability] = useState<number>(0);
  const [availability, setAvailability] = useState<string[]>([]);

  // Fetch Organizer's Events to populate the dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].event_id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, [token]);

  // Fetch Workers based on Filters
  const fetchWorkers = useCallback(async () => {
    if (!selectedEventId) return; // Wait until an event is selected
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('event_id', selectedEventId);
      
      skills.forEach(s => params.append('skills', s));
      if (minRating > 0) params.append('min_rating', minRating.toString());
      if (priceRange.min > 0) params.append('min_price', priceRange.min.toString());
      if (priceRange.max < 20000) params.append('max_price', priceRange.max.toString());
      params.append('radius_km', radius.toString());
      if (minReliability > 0) params.append('min_reliability', minReliability.toString());
      availability.forEach(a => params.append('availability', a));

      const res = await fetch(`${API_BASE}/workers/filter?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error("Failed to fetch workers", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, skills, minRating, priceRange, radius, minReliability, availability, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [fetchWorkers]);

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const toggleAvailability = (slot: string) => {
    setAvailability(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const filteredCrew = workers.filter(worker => 
    worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.skill_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full relative">
      <div className={`flex-1 space-y-8 animate-in fade-in duration-300 pr-4 ${showFilters ? 'mr-[320px]' : ''} transition-all`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Crew Network</h1>
            <p className="text-slate-500 mt-1">Manage and view details of all the workers in your network.</p>
          </div>
          <div className="flex bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold border border-indigo-100 shadow-sm">
            Total Workers: {workers.length}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search crew by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-sm"
            />
          </div>
          
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="" disabled>Select Event context...</option>
            {events.map(ev => (
              <option key={ev.event_id} value={ev.event_id}>{ev.event_type} at {ev.location}</option>
            ))}
          </select>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-xl font-semibold transition-colors shadow-sm ${
              showFilters 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Crew Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium animate-pulse">Loading crew...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCrew.map(worker => (
              <div key={worker.worker_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col h-full">
                
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center ring-4 ring-indigo-50">
                        {worker.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{worker.full_name}</h3>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded-md">
                            {worker.skill_category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6 mt-6">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-700">{worker.distance_km} km away</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <Star className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-700">{worker.rating} <span className="text-slate-400 font-medium">/ 5.0</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-700">{worker.reliability_score}% <span className="text-slate-400 font-medium">Reliability</span></span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 mt-auto">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Rate</p>
                    <p className="font-bold text-slate-900 flex items-center">
                      {worker.price}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold rounded-lg transition-colors border border-indigo-100 shadow-sm">
                    <Mail className="w-4 h-4" />
                    Contact
                  </button>
                </div>

              </div>
            ))}

            {filteredCrew.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl border-dashed">
                <p className="text-slate-500 font-medium">No crew members found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      {showFilters && (
        <div className="w-[320px] bg-white border-l border-slate-200 h-[calc(100vh-80px)] fixed right-0 top-[80px] overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 z-40 p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              Filters
            </h2>
            <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8 pb-12">
            {/* Skills */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS_LIST.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      skills.includes(skill)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Proximity */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Distance</h3>
                <span className="text-sm font-bold text-indigo-600">Within {radius} km</span>
              </div>
              <input 
                type="range" 
                min="5" max="100" step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>5km</span>
                <span>100km</span>
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Price Range (₹)</h3>
              <div className="flex gap-4 items-center">
                <input 
                  type="number" 
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({...prev, min: parseInt(e.target.value) || 0}))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Min"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="number" 
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({...prev, max: parseInt(e.target.value) || 0}))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Min Rating</h3>
                <span className="text-sm font-bold text-indigo-600">{minRating} Stars</span>
              </div>
              <input 
                type="range" 
                min="0" max="5" step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Reliability */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Min Reliability</h3>
                <span className="text-sm font-bold text-indigo-600">{minReliability}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" step="5"
                value={minReliability}
                onChange={(e) => setMinReliability(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Availability</h3>
              <div className="flex flex-col gap-3">
                {['Morning', 'Afternoon', 'Evening'].map(slot => (
                  <label key={slot} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={availability.includes(slot)}
                        onChange={() => toggleAvailability(slot)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none checked:border-indigo-600 checked:bg-indigo-600 transition-colors cursor-pointer"
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
                      </svg>
                    </div>
                    <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button 
              onClick={() => {
                setSkills([]);
                setMinRating(0);
                setPriceRange({min: 0, max: 20000});
                setRadius(25);
                setMinReliability(0);
                setAvailability([]);
              }}
              className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
