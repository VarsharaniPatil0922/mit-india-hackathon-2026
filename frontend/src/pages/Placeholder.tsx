import React from 'react';
import { useLocation } from 'react-router-dom';

export const Placeholder = () => {
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean).pop();
  const title = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Page';

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title} Coming Soon</h2>
      <p className="text-slate-500 max-w-md">
        This feature is currently under development. Check back later for updates.
      </p>
    </div>
  );
};
