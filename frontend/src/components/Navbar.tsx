import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 text-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-extrabold text-slate-900">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="tracking-tight">CrewConnect</span>
            </Link>
          </div>
          
          {/* Center: Navigation (Desktop only) */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#organizers" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">For Organizers</a>
            <a href="#workers" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">For Workers</a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  {user.email.split('@')[0]}
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link to={`/${user.userType}/dashboard`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-indigo-200 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
