import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, IndianRupee, CreditCard, Lock, ArrowRight, User } from 'lucide-react';
import { DEMO_OPTIMIZATION_RESULT } from '../services/demoData';

export const CrewSummary = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const data = DEMO_OPTIMIZATION_RESULT;
  
  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-xl text-slate-600 mb-12">
          Your optimal crew has been officially booked. Escrow accounts have been funded and the crew has been notified.
        </p>

        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 inline-block text-left mb-12 min-w-[300px]">
          <div className="text-sm text-slate-500 mb-1">Transaction ID</div>
          <div className="font-mono text-slate-900 font-bold mb-4">TXN-847294729-CC</div>
          
          <div className="text-sm text-slate-500 mb-1">Amount Paid (Escrow)</div>
          <div className="text-2xl text-slate-900 font-bold mb-4 flex items-center"><IndianRupee className="w-5 h-5 mr-1" />{data.budget.used.toLocaleString()}</div>
          
          <div className="text-sm text-slate-500 mb-1">Status</div>
          <div className="inline-flex items-center text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-sm">
            Fully Funded
          </div>
        </div>

        <div className="space-x-4 flex justify-center">
          <button
            onClick={() => navigate('/organizer/live/demo-event-1')}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-200"
          >
            Go to Live Event Dashboard <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Review & Checkout</h1>
        <p className="text-slate-600">Secure your crew by funding the escrow. Funds are only released after successful event completion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Invoice Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-900">Crew Invoice</h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-xs uppercase tracking-wider">
                {data.crew.length} Roles Filled
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {data.crew.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.selected.name}</p>
                      <p className="text-sm text-slate-500">{item.role} {item.quantity > 1 ? `(Team of ${item.quantity})` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 flex items-center justify-end">
                      <IndianRupee className="w-4 h-4 mr-0.5" />{item.selected.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-200">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Subtotal</span>
                <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{data.budget.used.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 mb-4">
                <span>Platform Fee (2%)</span>
                <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{(data.budget.used * 0.02).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 pt-4 border-t border-slate-200">
                <span>Total Escrow Amount</span>
                <span className="flex items-center text-indigo-600"><IndianRupee className="w-5 h-5 mr-1" />{(data.budget.used * 1.02).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Payment Details
            </h2>

            <div className="space-y-4 mb-8">
              <div className="border border-indigo-500 bg-indigo-50/30 p-4 rounded-xl flex items-start gap-3 cursor-pointer">
                <input type="radio" name="payment" className="mt-1" defaultChecked />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Credit Card</p>
                  <p className="text-xs text-slate-500 mt-1">Visa ending in 4242</p>
                </div>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-300">
                <input type="radio" name="payment" className="mt-1" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">UPI</p>
                  <p className="text-xs text-slate-500 mt-1">Pay via Google Pay, PhonePe</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center ${
                isProcessing 
                  ? 'bg-indigo-400 text-white cursor-wait' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Pay & Book Crew
                </span>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Payments are secured in escrow
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
