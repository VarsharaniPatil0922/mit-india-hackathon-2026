import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle, Clock, Zap, RefreshCw, IndianRupee, ShieldCheck, MapPin, Star, User
} from 'lucide-react';
import { DEMO_OPTIMIZATION_RESULT, CASCADE_DEMO_RESULT } from '../services/demoData';

export const LiveEventDashboard = () => {
  const { eventId } = useParams();
  
  // 'stable' -> 'crisis' -> 'reoptimizing' -> 'resolved'
  const [status, setStatus] = useState<'stable' | 'crisis' | 'reoptimizing' | 'resolved'>('stable');
  
  const currentData = status === 'resolved' ? CASCADE_DEMO_RESULT : DEMO_OPTIMIZATION_RESULT;

  const triggerDropout = () => {
    setStatus('crisis');
  };

  const handleReoptimize = () => {
    setStatus('reoptimizing');
    setTimeout(() => {
      setStatus('resolved');
    }, 2500); // simulate thinking
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <Clock className="w-3 h-3 mr-1" /> Event starts in 2 hours
            </span>
            {status === 'stable' && (
              <span className="flex items-center text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 mr-1" /> All Systems Go
              </span>
            )}
            {status === 'crisis' && (
              <span className="flex items-center text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700 px-2 py-1 rounded animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
              </span>
            )}
            {status === 'resolved' && (
              <span className="flex items-center text-xs font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                <Zap className="w-3 h-3 mr-1" /> Cascade Re-optimized
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Live Mission Control</h1>
        </div>
        
        {/* Hackathon Demo Controls */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Controls</span>
          <button 
            onClick={triggerDropout}
            disabled={status !== 'stable'}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              status === 'stable' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Simulate Drop-out
          </button>
          <button 
            onClick={() => setStatus('stable')}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Alert Banner (Crisis Mode) */}
      {status === 'crisis' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm mb-8 flex items-start justify-between animate-in slide-in-from-top-4 fade-in">
          <div className="flex gap-4">
            <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Critical: Worker Cancellation</h3>
              <p className="text-red-700 mb-3">
                <strong>Priya Sharma (Photographer)</strong> has just cancelled due to a medical emergency. 
                Traditional platforms would just find another photographer, potentially going over budget. 
                CrewConnect can run a Cascade Re-optimization to find the global optimum for the entire crew.
              </p>
              <button 
                onClick={handleReoptimize}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-md shadow-red-200 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Cascade Re-optimization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Banner (Reoptimizing Mode) */}
      {status === 'reoptimizing' && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm mb-8 flex items-center gap-4">
          <div className="p-2 bg-white rounded-full text-indigo-600 shrink-0">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900 mb-1">Calculating Cascade Re-optimization...</h3>
            <p className="text-indigo-700 text-sm">
              Analyzing 10,000+ permutations across all roles. Reallocating budgets dynamically based on backup availability...
            </p>
          </div>
        </div>
      )}

      {/* Alert Banner (Resolved Mode) */}
      {status === 'resolved' && (
        <div className="bg-indigo-50 border-2 border-indigo-200 p-6 rounded-2xl shadow-sm mb-8 flex items-start gap-4 animate-in fade-in duration-500">
          <div className="p-2 bg-indigo-600 rounded-full text-white shrink-0 mt-1">
            <Zap className="w-6 h-6" />
          </div>
          <div className="w-full">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Cascade Optimization Complete!</h3>
            <p className="text-indigo-800 mb-4">
              By looking at the <strong>entire crew holistically</strong> rather than just replacing one person, we found a better outcome:
            </p>
            <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-indigo-100">
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">1</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Cheaper Backup Promoted</p>
                  <p className="text-xs text-slate-600">Replaced Priya (₹8,000) with Sneha (₹7,500), freeing up ₹500 in the budget.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">2</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Budget Reallocated</p>
                  <p className="text-xs text-slate-600">Used the ₹500 to upgrade the Decorator to Meera Creations (higher reliability) to offset the risk of the recent cancellation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crew Overview */}
      <div className={`transition-opacity duration-300 ${status === 'reoptimizing' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-slate-900">Active Crew Roster</h2>
          <div className="text-right">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-slate-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              {currentData.budget.used.toLocaleString()} 
              <span className="text-sm font-normal text-slate-400 ml-2">/ {currentData.budget.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {currentData.crew.map((item, idx) => {
            const isChanged = status === 'resolved' && (item.role === 'Photographer' || item.role === 'Decorator');
            
            return (
              <div key={idx} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden transition-all duration-500 ${
                isChanged ? 'border-indigo-400 shadow-indigo-100/50' : 'border-slate-200'
              }`}>
                
                {isChanged && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Re-optimized
                  </div>
                )}

                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-indigo-600 mb-1">{item.role}</p>
                      <h3 className="text-lg font-bold text-slate-900">{item.selected.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 flex items-center justify-end text-lg">
                        <IndianRupee className="w-4 h-4 mr-0.5" />{item.selected.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600 mb-4">
                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded"><Star className="w-3 h-3 text-amber-400 mr-1 fill-current" /> {item.selected.rating}</span>
                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded"><ShieldCheck className="w-3 h-3 text-emerald-500 mr-1" /> {item.selected.reliability}%</span>
                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded"><MapPin className="w-3 h-3 text-red-400 mr-1" /> {item.selected.distance} km</span>
                  </div>

                  {isChanged && (
                    <div className="bg-indigo-50/50 rounded-lg p-3 text-xs text-indigo-800 font-medium">
                      <span className="font-bold text-indigo-600">AI Logic: </span> 
                      {item.selected.reasons[0]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
