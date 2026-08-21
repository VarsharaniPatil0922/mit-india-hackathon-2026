import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Users, IndianRupee, Activity } from 'lucide-react';

export const CrewSummary = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="mb-8 flex justify-center">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
      </div>
      
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Crew Successfully Assembled!</h1>
      <p className="text-xl text-slate-600 mb-12">
        Your requests have been sent to the selected freelancers. They will notify you once accepted.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-center mb-4">
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Total Crew</h3>
          <p className="text-3xl font-bold text-blue-600">3 Members</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-center mb-4">
            <IndianRupee className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Estimated Cost</h3>
          <p className="text-3xl font-bold text-green-600">₹14,500</p>
          <p className="text-sm text-slate-500 mt-1">Well within ₹150k budget</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-center mb-4">
            <Activity className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Crew Resilience</h3>
          <p className="text-3xl font-bold text-indigo-600">92/100</p>
          <p className="text-sm text-slate-500 mt-1">High Reliability</p>
        </div>
      </div>

      <div className="space-x-4">
        <Link
          to="/organizer/dashboard"
          className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Return to Dashboard
        </Link>
        <Link
          to="/login?type=worker"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Simulate Worker Login
        </Link>
      </div>
    </div>
  );
};
