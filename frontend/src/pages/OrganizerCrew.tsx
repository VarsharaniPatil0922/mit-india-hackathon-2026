import React, { useState } from 'react';
import { MOCK_WORKERS } from '../mock/workers';
import { Search, Filter, Star, MapPin, ShieldCheck, IndianRupee, Mail, MoreVertical } from 'lucide-react';

export const OrganizerCrew = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrew = MOCK_WORKERS.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.skillCategories.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    worker.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Crew Network</h1>
          <p className="text-slate-500 mt-1">Manage and view details of all the workers in your network.</p>
        </div>
        <div className="flex bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold border border-indigo-100 shadow-sm">
          Total Workers: {MOCK_WORKERS.length}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search crew by name, role, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Crew Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCrew.map(worker => (
          <div key={worker.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all group">
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center ring-4 ring-indigo-50">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{worker.name}</h3>
                    <div className="flex gap-1 mt-0.5">
                      {worker.skillCategories.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6 mt-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700">{worker.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-700">{worker.rating} <span className="text-slate-400 font-medium">/ 5.0 Rating</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-700">{worker.reliabilityScore}% <span className="text-slate-400 font-medium">Reliability</span></span>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Rate</p>
                  <p className="font-bold text-slate-900 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {worker.priceMin.toLocaleString()} - {worker.priceMax.toLocaleString()}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 font-semibold rounded-lg transition-colors border border-slate-200">
                  <Mail className="w-4 h-4" />
                  Contact
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredCrew.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl border-dashed">
            <p className="text-slate-500 font-medium">No crew members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
