import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Star, Sparkles, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${
      darkMode 
        ? 'bg-black' 
        : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="max-w-md w-full space-y-6 md:space-y-8 text-center relative z-10">
        {/* Avatar/Logo */}
        <div className="relative">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mx-auto mb-6 shadow-2xl float-animation pulse-glow border-4 border-white/20">
            <img 
              src="/5aca0d6c-7f62-420d-9299-e85108fa6c39 copy copy.png" 
              alt="Satyam" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <GraduationCap size={16} className="text-white" />
          </div>
          {/* Additional sparkles around the image */}
          <div className="absolute -top-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Star size={10} className="text-white" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className={`space-y-4 md:space-y-6 rounded-2xl p-6 md:p-8 border ${
          darkMode 
            ? 'glass-dark border-white/20' 
            : 'bg-white/20 backdrop-blur-lg border-white/30'
        }`}>
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            👋 Welcome, Satyam!
          </h1>
          <p className="text-base md:text-xl text-white/90">
            Your personal app to crack<br />
            <span className="font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Navodaya & Sainik School
            </span>
          </p>

          {/* Features */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
              <span className="font-medium text-sm md:text-base">Comprehensive Practice Tests</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <span className="font-medium text-sm md:text-base">Detailed Performance Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
              <span className="font-medium text-sm md:text-base">Hindi & English Support</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 md:space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 text-sm md:text-lg"
            >
              <span>Start Your Journey</span>
              <ArrowRight size={20} />
            </button>

            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className={`w-full text-white font-medium py-2 md:py-3 px-4 md:px-6 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base ${
                  darkMode 
                    ? 'glass-dark hover:bg-white/20 border-white/20' 
                    : 'bg-white/10 hover:bg-white/20 border-white/30'
                }`}
              >
                <User size={16} />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-xs md:text-sm">
          Made with ❤️ for your success
        </p>
      </div>
    </div>
  );
};

export default Landing;