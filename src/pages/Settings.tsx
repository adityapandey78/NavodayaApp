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

        {/* Guest User Sign In */}
        {!user && (
          <div className={`rounded-2xl p-4 md:p-6 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <h2 className={`text-lg md:text-xl font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account</h2>
            
            {/* Welcome Page Style Design */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className={`absolute inset-0 ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500' 
                  : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
              } gradient-animate`}></div>
              <div className={`relative rounded-2xl p-6 md:p-8 ${
                darkMode ? 'glass-dark' : 'bg-white/20 backdrop-blur-lg border border-white/30'
              }`}>
                <div className="text-center space-y-6">
                  {/* Avatar with decorations */}
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-4 shadow-2xl float-animation pulse-glow border-4 border-white/20">
                      <img 
                        src="/5aca0d6c-7f62-420d-9299-e85108fa6c39 copy copy.png" 
                        alt="Satyam" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <User size={16} className="text-white" />
                    </div>
                    {/* Decorative elements around the image */}
                    <div className="absolute -top-6 -left-6 text-pink-400">
                      <Sparkles size={24} />
                    </div>
                    <div className="absolute -bottom-6 -right-6 text-cyan-400">
                      <Star size={20} />
                    </div>
                    <div className="absolute -top-8 right-2 text-yellow-400">
                      <Star size={18} />
                    </div>
                    <div className="absolute -bottom-2 -left-8 text-purple-400">
                      <Sparkles size={16} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      👋 Join PrepWithSatyam!
                    </h3>
                    <p className="text-base md:text-lg text-white/90 mb-4">
                      Create an account to unlock<br />
                      <span className="font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                        Premium Features
                      </span>
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center space-x-3 text-white/90">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm md:text-base">Sync Progress Across Devices</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-white/90">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                        <span className="font-medium text-sm md:text-base">Detailed Performance Analytics</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-white/90">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                        <span className="font-medium text-sm md:text-base">Secure Cloud Backup</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-sm md:text-lg"
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                </div>
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