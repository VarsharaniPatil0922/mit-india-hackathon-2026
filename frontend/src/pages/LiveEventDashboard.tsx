import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircle, Clock, IndianRupee, ShieldCheck, MapPin, Star, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export const LiveEventDashboard = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.token) return;
      try {
        const response = await fetch(`${API_BASE}/crew/${eventId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, user]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Loading live dashboard...</div>;
  }

  if (!data) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">Failed to load event data.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <Clock className="w-3 h-3 mr-1" /> Live Event
            </span>
            <span className="flex items-center text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
              <CheckCircle className="w-3 h-3 mr-1" /> Active
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Live Mission Control</h1>
        </div>
      </div>

      {/* Crew Overview */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-slate-900">Active Crew Roster</h2>
          <div className="text-right">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-slate-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              {data.budget.used.toLocaleString()} 
              <span className="text-sm font-normal text-slate-400 ml-2">/ {data.budget.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {data.crew.map((item: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden">
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
                    <p className={`text-xs font-bold uppercase mt-1 ${item.status === 'confirmed' ? 'text-emerald-600' : item.status === 'no_show' ? 'text-red-600' : item.status === 'declined' ? 'text-orange-600' : 'text-blue-600'}`}>
                      {item.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600 mb-4">
                  <span className="flex items-center bg-slate-50 px-2 py-1 rounded"><Star className="w-3 h-3 text-amber-400 mr-1 fill-current" /> {item.selected.rating}</span>
                  <span className="flex items-center bg-slate-50 px-2 py-1 rounded"><ShieldCheck className="w-3 h-3 text-emerald-500 mr-1" /> {item.selected.reliability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
