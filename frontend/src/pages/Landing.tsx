import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, UserPlus } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Don't just find freelancers. <br />
          <span className="text-blue-600">Assemble the right crew.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-12 leading-relaxed">
          CrewForge AI is an intelligent event staffing platform that optimizes skill, availability, budget, and reliability to build resilient teams.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Organizer Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <Building2 className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I am an Organizer</h2>
            <p className="text-slate-600 mb-6">Create events, manage budgets, and let our AI assemble the perfect team for your needs.</p>
            <Link 
              to="/login?type=organizer"
              className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              Login / Register
            </Link>
          </div>

          {/* Worker Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <UserPlus className="w-12 h-12 text-teal-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I am a Freelancer</h2>
            <p className="text-slate-600 mb-6">Join our pool of professionals, manage your availability, and get matched to high-quality events.</p>
            <Link 
              to="/login?type=worker"
              className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700"
            >
              Login / Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
