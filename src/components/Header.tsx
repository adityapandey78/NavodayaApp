import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  const canGoBack = location.pathname !== '/dashboard';

  const getPageTitle = () => {
    if (location.pathname.includes('/quiz/')) return 'Quiz';
    if (location.pathname.includes('/results/')) return 'Results';
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/quiz-selection') return 'Select Test';
    if (location.pathname === '/history') return 'History';
    if (location.pathname === '/admin') return 'Admin';
    if (location.pathname === '/settings') return 'Settings';
    return 'PrepWithSatyam';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {canGoBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-300" />
            </button>
          )}
          <h1 className="text-sm md:text-lg font-semibold text-white">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {darkMode ? 
              <Sun size={18} className="text-yellow-500" /> : 
              <Moon size={18} className="text-gray-300" />
            }
          </button>
          {location.pathname === '/dashboard' && (
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Settings size={18} className="text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;