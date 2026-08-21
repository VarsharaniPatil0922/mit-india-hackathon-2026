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

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Optimizing crew selection with AI...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Crew Optimization Results</h1>
        <p className="text-slate-600">Our AI has found the best matching candidates based on your budget, proximity, and reliability requirements.</p>
      </div>

      <div className="space-y-12">
        {results.map(({ role, candidates }) => {
          const selectedForRole = selectedWorkers[role.id] || [];
          const isFulfilled = selectedForRole.length === role.quantityNeeded;

          return (
            <div key={role.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{role.roleName}</h2>
                  <p className="text-sm text-slate-500">Need {role.quantityNeeded} • {selectedForRole.length} Selected</p>
                </div>
                {isFulfilled && (
                  <span className="inline-flex items-center space-x-1 text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Fulfilled</span>
                  </span>
                )}
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {candidates.map((worker: any, index: number) => {
                    const isSelected = selectedForRole.includes(worker.id);
                    const isPrimary = index < role.quantityNeeded;

                    return (
                      <div 
                        key={worker.id} 
                        className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border-2 transition-all ${
                          isSelected ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{worker.name}</h3>
                            {isPrimary ? (
                              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Optimal Match</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded">Backup #{index - role.quantityNeeded + 1}</span>
                            )}
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

                        <div className="md:ml-6 flex-shrink-0">
                          <button
                            onClick={() => handleSelect(role.id, worker.id, role.quantityNeeded)}
                            disabled={!isSelected && isFulfilled}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                              isSelected 
                                ? 'bg-teal-600 text-white hover:bg-teal-700' 
                                : isFulfilled 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
