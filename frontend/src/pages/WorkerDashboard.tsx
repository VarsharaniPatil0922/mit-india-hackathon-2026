import React, { useState, useEffect } from 'react';
import { Bell, MapPin, IndianRupee, Star, Calendar, CheckCircle, Clock, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { paymentsApi } from '../services/api';

export const WorkerDashboard = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const fetchOffersAndPayments = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/worker/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers);
      } else {
        showToast("Failed to fetch offers", true);
      }

      try {
        const pRes = await paymentsApi.getWorkerPayments(localStorage.getItem("token")!);
        setPayments(pRes);
      } catch (err) {
        console.error("Failed to fetch payments", err);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while fetching offers", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersAndPayments();
  }, []);

  const [isErrorToast, setIsErrorToast] = useState(false);

  const showToast = (msg: string, isError: boolean = false) => {
    setToastMsg(msg);
    setIsErrorToast(isError);
    setTimeout(() => {
      setToastMsg("");
      setIsErrorToast(false);
    }, 4000);
  };

  const handleAction = async (assignmentId: number, action: 'accepted' | 'declined') => {
    try {
      const res = await fetch("http://localhost:8000/api/worker/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ assignment_id: assignmentId, action }),
      });
      
      if (res.ok) {
        showToast(`You have ${action} the offer.`);
        fetchOffersAndPayments(); // Refresh state immediately
      } else {
        showToast("Failed to process your response", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while processing response", true);
    }
  };

  const totalEarnings = payments
    .filter(p => p.status === 'RELEASED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce flex items-center ${isErrorToast ? 'bg-red-600' : 'bg-slate-900'}`}>
          <CheckCircle className={`w-5 h-5 mr-3 ${isErrorToast ? 'text-white' : 'text-emerald-400'}`} />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

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
            Active Offers & Assignments
          </h2>
          
          <div className="space-y-6">
            {loading ? (
              <div className="text-slate-500 font-semibold p-6 text-center border-2 border-dashed rounded-xl">Loading your offers...</div>
            ) : offers.length === 0 ? (
              <div className="text-slate-500 font-semibold p-6 text-center border-2 border-dashed rounded-xl">No active offers at the moment.</div>
            ) : (
              offers.map(offer => {
                const payment = payments.find(p => p.assignment_id === offer.assignment_id);
                return (
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
                          
                          {/* ESCROW STATUS UI */}
                          {payment && payment.status === 'HELD_IN_ESCROW' && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg inline-block text-left">
                              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">Escrow Status</p>
                              <p className="text-sm text-emerald-800 font-bold flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-1" /> SECURED
                              </p>
                            </div>
                          )}
                          
                          {payment && payment.status === 'RELEASED' && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block text-left">
                              <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">✓ PAYMENT RELEASED</p>
                              <p className="text-sm text-blue-800 font-medium">
                                ₹{payment.amount.toLocaleString()} has been released to you.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {offer.status === 'pending' && (
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => handleAction(offer.assignment_id, 'accepted')}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
                          >
                            Accept Offer
                          </button>
                          <button 
                            onClick={() => handleAction(offer.assignment_id, 'declined')}
                            className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 py-3 rounded-xl font-bold transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {payments.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="font-bold text-slate-900">Payment History</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {payments.map(p => (
                  <div key={p.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">{p.transaction_id}</p>
                      <p className="text-xs text-slate-500 font-medium">{p.status.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 flex items-center justify-end">
                        <IndianRupee className="w-4 h-4 mr-1 text-slate-400" />
                        {p.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
            <h2 className="text-lg font-bold mb-4 relative z-10 text-slate-200 uppercase tracking-wider">Your Earnings</h2>
            <p className="text-4xl font-extrabold flex items-center relative z-10 text-emerald-400">
              <IndianRupee className="w-8 h-8 mr-1 opacity-80" />
              {totalEarnings.toLocaleString()}
            </p>
            <div className="mt-6 pt-4 border-t border-white/20 relative z-10 flex justify-between items-center">
              <span className="text-sm text-slate-300">From Released Payments</span>
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
