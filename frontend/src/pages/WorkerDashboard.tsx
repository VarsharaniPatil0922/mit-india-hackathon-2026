import React, { useState } from 'react';
import { Bell, MapPin, IndianRupee, Star, Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react';

export const WorkerDashboard = () => {
  const [offers, setOffers] = useState([
    {
      id: 'offer-1',
      eventName: 'MIT India Hackathon 2026 Finals',
      role: 'Photographer',
      date: 'Aug 25, 2026 • 09:00 AM',
      location: 'MIT Pune Campus, Kothrud',
      price: 8000,
      status: 'pending',
      expiresIn: '2 hours',
      matchScore: 96
    }
  ]);

  const handleAction = (id: string, action: 'accepted' | 'declined') => {
    setOffers(offers.map(o => o.id === id ? { ...o, status: action } : o));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Freelancer Hub</h1>
          <p className="text-slate-600 mt-1">Manage your bookings, availability, and earnings.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">PS</div>
            <div>
              <p className="text-sm font-bold text-slate-900">Priya Sharma</p>
              <p className="text-xs text-slate-500 flex items-center"><Star className="w-3 h-3 text-amber-400 mr-1 fill-current" /> 4.8 Pro</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-indigo-600" />
            Active Offers
          </h2>
          
          <div className="space-y-6">
            {offers.map(offer => (
              <div key={offer.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                offer.status === 'pending' ? 'border-indigo-200 shadow-indigo-100' : 'border-slate-200'
              }`}>
                {/* Status Banner */}
                {offer.status === 'pending' && (
                  <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                    <span className="flex items-center text-sm font-bold text-indigo-700">
                      <span className="flex h-2.5 w-2.5 relative mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </span>
                      New Offer Received
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 bg-white px-2 py-1 rounded shadow-sm border border-indigo-100">
                      Expires in {offer.expiresIn}
                    </span>
                  </div>
                )}
                
                {offer.status === 'accepted' && (
                  <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center text-sm font-bold text-emerald-700">
                    <CheckCircle className="w-4 h-4 mr-2" /> Offer Accepted - Job Secured
                  </div>
                )}

                {offer.status === 'declined' && (
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center text-sm font-bold text-slate-600">
                    Offer Declined
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{offer.eventName}</h3>
                      <p className="text-indigo-600 font-semibold mb-4">{offer.role}</p>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400" /> {offer.date}</p>
                        <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-400" /> {offer.location}</p>
                      </div>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-sm text-slate-500 font-medium mb-1">Guaranteed Payout</p>
                      <p className="text-3xl font-bold text-slate-900 flex items-center md:justify-end">
                        <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                        {offer.price.toLocaleString()}
                      </p>
                      {offer.status === 'pending' && (
                        <p className="text-xs text-emerald-600 font-semibold mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">
                          ✓ Funds in Escrow
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {offer.status === 'pending' && (
                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleAction(offer.id, 'accepted')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
                      >
                        Accept Offer
                      </button>
                      <button 
                        onClick={() => handleAction(offer.id, 'declined')}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 py-3 rounded-xl font-bold transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
            <h2 className="text-lg font-bold mb-4 relative z-10">Earnings this Month</h2>
            <p className="text-4xl font-extrabold flex items-center relative z-10">
              <IndianRupee className="w-8 h-8 mr-1 opacity-80" />
              42,500
            </p>
            <div className="mt-6 pt-4 border-t border-white/20 relative z-10 flex justify-between items-center">
              <span className="text-sm text-slate-300">3 Upcoming Jobs</span>
              <button className="text-sm font-bold text-indigo-300 hover:text-white flex items-center transition-colors">
                View Ledger <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Availability Stats</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="text-slate-600">Reliability Score</span>
                  <span className="text-emerald-600">96%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Excellent! Higher score = more offers.</p>
              </div>
            </div>

            <button className="w-full mt-6 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              Update Calendar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
