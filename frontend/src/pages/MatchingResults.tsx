import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldCheck, MapPin, CheckCircle, IndianRupee } from 'lucide-react';

export const MatchingResults = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<any[]>([]);
  const [backupPools, setBackupPools] = useState<any[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [simulatingNoShow, setSimulatingNoShow] = useState(false);
  const [cascadeSteps, setCascadeSteps] = useState<string[]>([]);
  const [cascadeResult, setCascadeResult] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const fetchOptimization = async () => {
      if (!user || !user.token) return;
      try {
        const response = await fetch(`http://localhost:8000/api/crew/optimize/${eventId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.candidate_pools) {
            setResults(data.candidate_pools);
            if (data.backup_pools) {
              setBackupPools(data.backup_pools);
            }
            if (data.status === "optimized" && data.crew) {
              const preSelected: Record<string, string[]> = {};
              data.crew.forEach((c: any) => {
                if (!preSelected[c.role_id]) {
                  preSelected[c.role_id] = [];
                }
                preSelected[c.role_id].push(String(c.worker_id));
              });
              setSelectedWorkers(preSelected);
            }
          } else {
            setResults(data);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptimization();
  }, [eventId, user]);

  const handleSelect = (roleId: string, workerId: string, quantity: number) => {
    setSelectedWorkers(prev => {
      const current = prev[roleId] || [];
      if (current.includes(workerId)) {
        return { ...prev, [roleId]: current.filter(id => id !== workerId) };
      }
      if (current.length < quantity) {
        return { ...prev, [roleId]: [...current, workerId] };
      }
      return prev;
    });
  };

  const handleConfirmCrew = async () => {
    if (!user || !user.token) return;
    
    // Flatten selected workers into CrewAssignment format
    const assignments: any[] = [];
    Object.keys(selectedWorkers).forEach(roleId => {
      selectedWorkers[roleId].forEach(workerId => {
        // Find the agreed price (avg of min and max) for simplicity in MVP
        const roleData = results.find(r => r.role.id === roleId);
        const workerData = roleData?.candidates.find((c: any) => c.id === workerId);
        const priceAgreed = workerData ? (workerData.priceMin + workerData.priceMax) / 2 : 0;

        assignments.push({
          event_id: Number(eventId),
          role_id: Number(roleId),
          worker_id: Number(workerId),
          price_agreed: priceAgreed
        });
      });
    });

    try {
      const response = await fetch('http://localhost:8000/api/crew/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(assignments)
      });
      if (response.ok) {
        navigate('/organizer/crew-summary');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to confirm crew");
    }
  };

  const handleSimulateNoShow = async (workerId: string) => {
    if (!user || !user.token) return;
    
    setSimulatingNoShow(true);
    setCascadeSteps(["Worker unavailable"]);
    
    setTimeout(() => setCascadeSteps(prev => [...prev, "Candidate pool updated"]), 600);
    setTimeout(() => setCascadeSteps(prev => [...prev, "Constraints recalculated"]), 1200);
    setTimeout(() => setCascadeSteps(prev => [...prev, "Workers rescored"]), 1800);
    setTimeout(() => setCascadeSteps(prev => [...prev, "Crew re-optimized"]), 2400);

    try {
      const response = await fetch('http://localhost:8000/api/crew/replace-worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ event_id: Number(eventId), worker_id: Number(workerId) })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setTimeout(() => {
            setCascadeSteps(prev => [...prev, "New crew confirmed"]);
            setCascadeResult(data);
            showToast("Cascade Re-optimization Complete");
            setSimulatingNoShow(false);
            
            // Apply new state
            if (data.new_crew) {
              const preSelected: Record<string, string[]> = {};
              data.new_crew.forEach((c: any) => {
                if (!preSelected[String(c.role_id)]) {
                  preSelected[String(c.role_id)] = [];
                }
                preSelected[String(c.role_id)].push(String(c.worker_id));
              });
              setSelectedWorkers(preSelected);
            }
            
            // Refetch original to get updated candidate pools (or just keep the old candidates for UI display)
            // Let's refetch to get clean state
            fetch(`http://localhost:8000/api/crew/optimize/${eventId}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            }).then(r => r.json()).then(newData => {
                if (newData.candidate_pools) {
                    setResults(newData.candidate_pools);
                }
            });
            
        }, 3000);
      } else {
        alert("Simulation failed");
        setSimulatingNoShow(false);
      }
    } catch (error) {
      console.error(error);
      alert("Simulation failed");
      setSimulatingNoShow(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Optimizing crew selection with AI...</div>;
  }
  
  if (simulatingNoShow) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 animate-pulse">RE-OPTIMIZING...</h2>
        <div className="space-y-4 max-w-sm mx-auto">
          {cascadeSteps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-lg font-medium text-slate-700 bg-white shadow-sm border border-slate-200 py-3 px-6 rounded-lg w-full">
                {step}
              </div>
              {i < cascadeSteps.length - 1 && (
                <div className="h-6 w-px bg-slate-300 my-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce flex items-center">
          <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Cascade Result Modal */}
      {cascadeResult && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Cascade Re-optimization Complete</h2>
              <button onClick={() => setCascadeResult(null)} className="text-indigo-200 hover:text-white font-bold">✕</button>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold text-red-700 uppercase mb-2">Unavailable Worker</h3>
                <p className="text-slate-800 font-medium">
                  {cascadeResult.removed_worker?.name} — {cascadeResult.removed_worker?.roleName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">Previous Cost</h3>
                  <p className="text-xl font-bold text-slate-800">₹{cascadeResult.previous_cost?.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase mb-1">New Cost</h3>
                  <p className="text-xl font-bold text-emerald-800">₹{cascadeResult.new_cost?.toLocaleString()}</p>
                </div>
                <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-xs font-bold text-blue-700 uppercase mb-1">Event Budget</h3>
                  <p className="text-xl font-bold text-blue-800">₹{cascadeResult.budget?.toLocaleString()}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 border-b pb-2">New Recommended Crew</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cascadeResult.new_crew?.map((c: any, i: number) => (
                   <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded">
                     <span className="font-medium text-slate-800">{c.worker_name}</span>
                     <span className="text-slate-500">{c.role_name}</span>
                   </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setCascadeResult(null)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700"
                >
                  View New Crew
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Crew Optimization Results</h1>
        <p className="text-slate-600">Our AI has found the best matching candidates based on your budget, proximity, and reliability requirements.</p>
      </div>

      <div className="space-y-12">
        {results.map(({ role, candidates }) => {
          const selectedForRole = selectedWorkers[role.id] || [];
          
          // Separate primary and backups based on selection
          const primaryCrew = candidates.filter((c: any) => selectedForRole.includes(String(c.id)));
          const backupCrew = candidates.filter((c: any) => !selectedForRole.includes(String(c.id)));

          const isFulfilled = primaryCrew.length === role.quantityNeeded;

          return (
            <div key={role.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{role.roleName}</h2>
                  <p className="text-sm text-slate-500">Need {role.quantityNeeded} • {primaryCrew.length} Selected</p>
                </div>
                {isFulfilled && (
                  <span className="inline-flex items-center space-x-1 text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Fulfilled</span>
                  </span>
                )}
              </div>
              
              <div className="p-6">
                {/* PRIMARY CREW SECTION */}
                <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-4 flex items-center border-b pb-2">
                  Primary Crew
                </h3>
                <div className="space-y-4 mb-8">
                  {primaryCrew.length === 0 ? (
                     <p className="text-slate-500 text-sm italic">No primary workers selected.</p>
                  ) : (
                    primaryCrew.map((worker: any) => (
                      <div 
                        key={worker.id} 
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border-2 border-teal-500 bg-teal-50 transition-all"
                      >
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{worker.name}</h3>
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Optimal Match</span>
                            <span className="text-sm font-medium text-slate-500">Score: {worker.score}/100</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                              <span>{worker.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <ShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                              <span>{worker.reliabilityScore}% Reliable</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-red-400 mr-1" />
                              <span>{worker.distanceKm} km away</span>
                            </div>
                            <div className="flex items-center font-medium text-slate-800">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              <span>{worker.priceMin} - {worker.priceMax}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {worker.matchReasons.map((reason: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md">
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="md:ml-6 flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleSimulateNoShow(worker.id)}
                            className="px-4 py-2 text-sm rounded-lg font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                          >
                            🛡️ SIMULATE NO-SHOW
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* BACKUP OPTIONS SECTION */}
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 mt-8 flex items-center border-b pb-2">
                  Backup Options
                </h3>
                <div className="space-y-4">
                  {backupCrew.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No backup candidates available for this role.</p>
                  ) : (
                    backupCrew.map((worker: any, index: number) => (
                      <div 
                        key={worker.id} 
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border-2 border-slate-100 bg-white hover:border-slate-200 transition-all opacity-80"
                      >
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-700">{worker.name}</h3>
                            <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded">Backup #{index + 1}</span>
                            <span className="text-sm font-medium text-slate-500">Score: {worker.score}/100</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                              <span>{worker.rating}</span>
                              <ShieldCheck className="w-4 h-4 text-green-500 ml-3 mr-1" />
                              <span>{worker.reliabilityScore}%</span>
                            </div>
                            <div className="flex items-center font-medium text-slate-800">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              <span>{worker.priceMin} - {worker.priceMax}</span>
                            </div>
                          </div>
                        </div>

                        <div className="md:ml-6 flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleSelect(role.id, worker.id, role.quantityNeeded)}
                            disabled={isFulfilled}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                              isFulfilled 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            Swap In
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {backupPools.length > 0 && (
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">BACKUP OPTIONS</h2>
            <p className="text-sm text-slate-500">Ranked standby candidates for potential replacements.</p>
          </div>
          <div className="p-6 space-y-6">
            {backupPools.map((pool: any, pIdx: number) => (
              <div key={pIdx}>
                <h3 className="text-lg font-bold text-slate-700 mb-3">{pool.role_name}</h3>
                {pool.backups.length === 0 ? (
                  <p className="text-slate-500 italic text-sm">No backups available.</p>
                ) : (
                  <ul className="space-y-2">
                    {pool.backups.map((backup: any, bIdx: number) => (
                      <li key={bIdx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="font-medium text-slate-700">
                          Backup {backup.rank} &mdash; {backup.name} &mdash; {backup.score}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          <IndianRupee className="w-3 h-3 inline mr-1"/>
                          {backup.estimated_price}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 font-medium">Crew Assembly Progress</p>
            <p className="text-lg font-bold text-slate-900">
              {Object.values(selectedWorkers).flat().length} Selected
            </p>
          </div>
          <button
            onClick={handleConfirmCrew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Review & Confirm Crew
          </button>
        </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};
