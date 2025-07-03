import React from 'react';
import { Moon, Sun, User, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useQuiz } from '../contexts/QuizContext';

const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { testAttempts } = useQuiz();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-white/80 mt-2 text-lg">
              Manage your preferences
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Hello, Satyam!</h2>
              <p className="text-white/80 text-lg">Keep up the great work</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-300">
                {testAttempts.length}
              </p>
              <p className="text-white/80 font-medium">Total Tests</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-300">
                {testAttempts.length > 0 
                  ? Math.round(testAttempts.reduce((sum, a) => sum + a.percentage, 0) / testAttempts.length)
                  : 0}%
              </p>
              <p className="text-white/80 font-medium">Average Score</p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
              <div className="flex items-center space-x-4">
                {darkMode ? (
                  <Sun size={24} className="text-yellow-400" />
                ) : (
                  <Moon size={24} className="text-white" />
                )}
                <div>
                  <p className="font-bold text-white">Dark Mode</p>
                  <p className="text-white/80 text-sm">Easy on the eyes</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">About</h2>
          
          <div className="space-y-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">PrepWithSatyam</h3>
            <p className="text-white/80 text-lg">
              Your companion for Navodaya & Sainik School preparation
            </p>
            <p className="text-white/60">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;