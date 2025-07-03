import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Star, Sparkles, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        {/* Avatar/Logo */}
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <GraduationCap size={48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white">
            👋 Welcome, Satyam!
          </h1>
          <p className="text-xl text-white/90">
            Your personal app to crack<br />
            <span className="font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Navodaya & Sainik School
            </span>
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
              <span className="font-medium">Comprehensive Practice Tests</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <span className="font-medium">Detailed Performance Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
              <span className="font-medium">Hindi & English Support</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <span className="text-lg">Start Your Journey</span>
              <ArrowRight size={24} />
            </button>

            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl border border-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <User size={20} />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-sm">
          Made with ❤️ for your success
        </p>
      </div>
    </div>
  );
};

export default Landing;