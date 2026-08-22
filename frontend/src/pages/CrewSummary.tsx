import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, IndianRupee, CreditCard, Lock, ArrowRight, User } from 'lucide-react';
import { paymentsApi, API_BASE } from '../services/api';

export const CrewSummary = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [data, setData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCrewAndPayments = async () => {
    if (!user || !user.token) return;
    try {
      const response = await fetch(`${API_BASE}/crew/summary/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const text = await response.text();
        console.error("Failed to load summary:", text);
      }

      try {
        const pRes = await paymentsApi.getEventPayments(eventId as string, user.token);
        setPayments(pRes);
      } catch (err) {
        setPayments([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrewAndPayments();
  }, [eventId, user]);
  
  const handleCreateEscrow = async () => {
    setIsProcessing(true);
    try {
      // Create a payment for each assignment
      for (const item of data.primary_crew) {
        await paymentsApi.createPayment(item.assignment_id, user!.token!);
      }
      await fetchCrewAndPayments();
    } catch (error) {
      console.error("Failed to create escrow", error);
      alert("Failed to create escrow payments");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      for (const p of payments) {
        if (p.status === 'PENDING') {
          await paymentsApi.payEscrow(p.id, user!.token!);
        }
      }
      setIsSuccess(true);
      await fetchCrewAndPayments();
    } catch (error) {
      console.error("Failed to simulate payment", error);
      alert("Failed to pay escrow");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReleasePayment = async () => {
    setIsProcessing(true);
    try {
      for (const p of payments) {
        if (p.status === 'HELD_IN_ESCROW') {
          await paymentsApi.releasePayment(p.id, user!.token!);
        }
      }
      await fetchCrewAndPayments();
    } catch (error) {
      console.error("Failed to release payment", error);
      alert("Failed to release payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">✓ Payment successful</h1>
        <p className="text-xl text-slate-600 mb-12">
          ₹{data?.budget?.used?.toLocaleString()} secured in CrewConnect Escrow
        </p>

        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 inline-block text-left mb-12 min-w-[300px]">
          <div className="text-sm text-slate-500 mb-1">Transaction ID</div>
          <div className="font-mono text-slate-900 font-bold mb-4">{payments.length > 0 ? payments[0].transaction_id : 'CC-DEMO-XXXXXX'}</div>
          
          <div className="text-sm text-slate-500 mb-1">Amount Paid (Escrow)</div>
          <div className="text-2xl text-slate-900 font-bold mb-4 flex items-center"><IndianRupee className="w-5 h-5 mr-1" />{data.budget.used.toLocaleString()}</div>
          
          <div className="text-sm text-slate-500 mb-1">Status</div>
          <div className="inline-flex items-center text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-sm">
            FUNDS HELD IN ESCROW
          </div>
        </div>

        <div className="space-x-4 flex justify-center">
          <button
            onClick={() => setIsSuccess(false)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-200"
          >
            Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-24 text-center">Loading Invoice...</div>;
  }

  if (!data || !data.primary_crew) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="text-red-500 font-bold mb-2">Failed to load crew data.</div>
        <p className="text-slate-500 text-sm">Make sure Event {eventId} exists and has crew assigned.</p>
      </div>
    );
  }

  const escrowStatus = payments.length === 0 ? 'NONE' : payments[0].status;
  const transactionId = payments.length > 0 ? payments[0].transaction_id : 'PENDING-GEN';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">AI Selected Demo Crew</h1>
        <p className="text-slate-600">Review your AI-optimized crew and secure them by funding the escrow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Invoice Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-900">Primary Crew Invoice</h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-xs uppercase tracking-wider">
                {data.primary_crew.length} Roles Filled
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {data.primary_crew.map((item: any, idx: number) => (
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
                <span>TOTAL CREW COST</span>
                <span className="flex items-center font-bold text-slate-900 text-lg"><IndianRupee className="w-4 h-4 mr-0.5" />{data.budget.used.toLocaleString()}</span>
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

          {/* Backup Crew Section */}
          {data.backup_crew && data.backup_crew.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-bold text-slate-900">Backup Candidates</h2>
                <span className="px-3 py-1 bg-slate-200 text-slate-600 font-semibold rounded-full text-xs uppercase tracking-wider">
                  {data.backup_crew.length} On Standby
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {data.backup_crew.map((backup: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{backup.name}</p>
                        <p className="text-xs text-slate-500">{backup.role} • Match: {backup.score}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">
                        Standby
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Payment Details
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Escrow Status</p>
                <div className={`font-bold text-lg mb-4 ${
                  escrowStatus === 'RELEASED' ? 'text-blue-600' :
                  escrowStatus === 'HELD_IN_ESCROW' ? 'text-emerald-600' :
                  escrowStatus === 'PENDING' ? 'text-amber-500' : 'text-slate-500'
                }`}>
                  {escrowStatus === 'NONE' ? 'NOT STARTED' : escrowStatus.replace(/_/g, ' ')}
                </div>
                
                {escrowStatus !== 'NONE' && (
                  <>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Transaction ID</p>
                    <p className="font-mono text-sm text-slate-800 font-semibold bg-slate-200 p-2 rounded">{transactionId}</p>
                  </>
                )}
              </div>
            </div>

            {escrowStatus === 'NONE' && (
              <button
                onClick={handleCreateEscrow}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center ${
                  isProcessing ? 'bg-indigo-400 text-white cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {isProcessing ? 'Processing...' : 'CREATE ESCROW'}
              </button>
            )}

            {escrowStatus === 'PENDING' && (
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center ${
                  isProcessing ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                }`}
              >
                {isProcessing ? 'Processing...' : 'SIMULATE PAYMENT'}
              </button>
            )}

            {escrowStatus === 'HELD_IN_ESCROW' && (
              <button
                onClick={handleReleasePayment}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center ${
                  isProcessing ? 'bg-blue-400 text-white cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                {isProcessing ? 'Processing...' : 'RELEASE PAYMENT'}
              </button>
            )}

            {escrowStatus === 'RELEASED' && (
              <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-lg flex justify-center items-center border border-slate-200">
                FUNDS RELEASED
              </div>
            )}

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
