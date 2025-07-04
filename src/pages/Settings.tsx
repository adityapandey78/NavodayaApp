import React from 'react';
import { Moon, Sun, User, Shield, LogOut, Star, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const { testAttempts } = useQuiz();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut();
        showSuccess('Logged out successfully');
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-black' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className={`rounded-2xl p-6 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <h1 className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
            <p className={`mt-2 text-sm md:text-lg ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
              Manage your preferences
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className={`rounded-2xl p-4 md:p-6 border ${
          darkMode 
            ? 'glass-dark border-white/20' 
            : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
        }`}>
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user ? `Hello, ${user.email.split('@')[0]}!` : 'Hello, Satyam!'}
              </h2>
              <p className={`text-sm md:text-lg ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                {user ? user.email : 'Guest User - Keep up the great work'}
              </p>
            </div>
          </div>
          
          <div className={`grid grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6 border-t ${
            darkMode ? 'border-white/20' : 'border-gray-200'
          }`}>
            <div className="text-center">
              <p className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-cyan-300' : 'text-cyan-600'}`}>
                {testAttempts.length}
              </p>
              <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Total Tests</p>
            </div>
            <div className="text-center">
              <p className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>
                {testAttempts.length > 0 
                  ? Math.round(testAttempts.reduce((sum, a) => sum + a.percentage, 0) / testAttempts.length)
                  : 0}%
              </p>
              <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Average Score</p>
            </div>
          </div>
        </div>

        {/* Account Section */}
        {user && (
          <div className={`rounded-2xl p-4 md:p-6 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <h2 className={`text-lg md:text-xl font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account</h2>
            
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                darkMode ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <div className="flex items-center space-x-4">
                  <LogOut size={20} className="text-red-400" />
                  <div>
                    <p className={`font-bold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Logout
                    </p>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                      Sign out of your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-medium transition-all duration-300 text-sm md:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Appearance Settings */}
        <div className={`rounded-2xl p-4 md:p-6 border ${
          darkMode 
            ? 'glass-dark border-white/20' 
            : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
        }`}>
          <h2 className={`text-lg md:text-xl font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h2>
          
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
              darkMode ? 'bg-white/10' : 'bg-gray-100'
            }`}>
              <div className="flex items-center space-x-4">
                {darkMode ? (
                  <Moon size={20} className="text-purple-400" />
                ) : (
                  <Sun size={20} className="text-yellow-500" />
                )}
                <div>
                  <p className={`font-bold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                    {darkMode ? 'Easy on the eyes' : 'Bright and clear'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 md:h-8 md:w-14 items-center rounded-full transition-colors ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 md:h-6 md:w-6 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-5 md:translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className={`rounded-2xl p-4 md:p-6 border ${
          darkMode 
            ? 'glass-dark border-white/20' 
            : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
        }`}>
          <h2 className={`text-lg md:text-xl font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>About</h2>
          
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>PrepWithSatyam</h3>
            <p className={`text-sm md:text-lg ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
              Your companion for Navodaya & Sainik School preparation
            </p>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;