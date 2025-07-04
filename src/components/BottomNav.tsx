import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, History, Settings, Shield } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/admin', icon: Shield, label: 'Admin' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around py-1.5 sm:py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-purple-400 bg-purple-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <item.icon size={16} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-xs mt-0.5 sm:mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;