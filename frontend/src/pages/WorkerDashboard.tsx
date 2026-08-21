import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, MapPin, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.token) return;
      try {
        const response = await fetch('http://localhost:8000/api/worker/notifications', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);

  const handleAction = (id: string, action: 'accepted' | 'declined') => {
    // In a full app, this would hit another API endpoint to update the crew_assignment status
    setNotifications(notifications.map(n => n.id === id ? { ...n, status: action } : n));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Freelancer Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your bookings and availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-500" />
            Booking Offers & Notifications
          </h2>
          
          {loading ? (
            <p className="text-slate-500">Loading notifications...</p>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div key={notif.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full mb-2">
                        Event Request
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{notif.message}</h3>
                      <p className="text-xs text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                    {notif.status === 'unread' && (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    )}
                  </div>
                  
                  {notif.status === 'unread' ? (
                    <div className="flex space-x-4 border-t border-slate-100 pt-4">
                      <button 
                        onClick={() => handleAction(notif.id, 'accepted')}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Accept Offer
                      </button>
                      <button 
                        onClick={() => handleAction(notif.id, 'declined')}
                        className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 py-2 rounded-lg font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className={`text-center py-2 rounded-lg font-medium ${
                      notif.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      You have {notif.status} this offer.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 bg-white p-8 rounded-xl border border-slate-200 text-center">No new offers at the moment.</p>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Your Profile Summary</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-medium text-slate-900">{user?.email.split('@')[0] || 'Worker'}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-medium text-slate-900">Pune, MH</p>
            </div>
            <button className="w-full mt-4 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg font-medium transition-colors">
              Edit Profile & Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
