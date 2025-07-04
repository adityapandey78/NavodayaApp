import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, BookOpen, Award, Smile, GraduationCap, Wifi, WifiOff, Upload, AlertCircle, Target, Clock, Star, Zap } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { networkService } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { testAttempts, hasPendingAttempts, syncPendingAttempts } = useQuiz();
  const { showError, showInfo } = useToast();
  const [joke, setJoke] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const jokes = [
    "Test ka question paper dekhte hi laga... Teacher ne humse nahi, NASA se inspiration liya hai! 🚀📄",
    "Itna toh India World Cup jeetne ke baad nahi sochta, jitna main test ke ek MCQ pe sochta hoon. 🧠🤯",
    "Padhai ka plan banaya tha... par plan bhi soch raha hai – 'Bhai mujhe bhi mat ghasito!' 🗓️😂",
    "Paper ke end me likha tha – 'All the best'… Lagta hai teacher ko bhi doubt tha humse! 😅✍️",
    "Test ka timer dekhte hi laga – 'Yeh toh mere doston ke patience se bhi zyada fast chal raha hai!' ⏱️⚡",
    "Syllabus dekh ke lagta hai – Yeh toh school version of Avengers: Endless War hai! 📚🌀",
    "Me reading question 1: 'Hmm... easy lag raha hai.' Me reading question 2: 'Kya yeh bhi maths ka part hai?' Me reading question 3: *Existential crisis begins...* 😵",
    "Teacher: Attempt all questions. ❗ Me: Ma'am, mere pass optimism nahi hai, sirf blue pen hai! 🖊️💔",
    "Test ke options kuch aise hote hain:\nA) Sahi lag raha hai\nB) Ye bhi ho sakta hai\nC) Trick toh nahi hai?\nD) Teacher ne dushmani nikaali hai! 🤡",
    "Padhai aur neend ka toh rishta hi ulta hai... Jab padhna hota hai tab neend aati hai, Aur jab sona hota hai tab guilt aata hai! 🛏️📚😩"
  ];

  useEffect(() => {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setJoke(randomJoke);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const totalAttempts = testAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts)
    : 0;

  const recentAttempts = testAttempts.slice(-3).reverse();

  const handleStartTest = () => {
    if (!isOnline) {
      showError('Internet connection required to start a test. Please connect and try again.');
      return;
    }
    navigate('/quiz-selection');
  };

  const handleSyncPending = async () => {
    if (!isOnline) {
      showError('Internet connection required to upload results.');
      return;
    }
    
    try {
      await syncPendingAttempts();
    } catch (error) {
      // Error handling is done in the context
    }
  };

  return (
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className={`rounded-2xl p-4 border ${
            darkMode 
              ? 'glass-dark border-red-500/30' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              <WifiOff size={20} className={darkMode ? 'text-red-400' : 'text-red-600'} />
              <div>
                <p className={`font-bold text-sm md:text-base ${darkMode ? 'text-red-200' : 'text-red-800'}`}>No Internet Connection</p>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>You can continue taking tests, but results will be saved locally until connection is restored.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Results Banner */}
        {hasPendingAttempts && (
          <div className={`rounded-2xl p-4 border ${
            darkMode 
              ? 'glass-dark border-yellow-500/30' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload size={20} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                <div>
                  <p className={`font-bold text-sm md:text-base ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>Pending Results</p>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>You have test results waiting to be uploaded to the server.</p>
                </div>
              </div>
              <button
                onClick={handleSyncPending}
                disabled={!isOnline}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${
                  darkMode
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-black disabled:text-gray-300'
                    : 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white'
                }`}
              >
                {isOnline ? 'Upload Now' : 'No Internet'}
              </button>
            </div>
          </div>
        )}

        {/* Hero Section with Satyam Image */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className={`absolute inset-0 ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500' 
              : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
          } gradient-animate`}></div>
          <div className={`relative rounded-3xl p-6 md:p-8 ${
            darkMode ? 'glass-dark' : 'bg-white/20 backdrop-blur-lg border border-white/30'
          }`}>
                  )}
                </div>
                <h1 className={`text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent'
                    : 'text-white'
                }`}>
                  Welcome back, Satyam!
                </h1>
                <p className={`text-base md:text-xl lg:text-2xl mb-4 md:mb-6 ${
                  darkMode ? 'text-blue-100' : 'text-white/90'
                }`}>Ready to ace your next test?</p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                  <div className={`flex items-center space-x-2 rounded-full px-3 py-2 ${
                    darkMode ? 'bg-white/10' : 'bg-white/20'
                  }`}>
                    <Target size={16} className={darkMode ? 'text-cyan-400' : 'text-cyan-200'} />
                    <span className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white' : 'text-white/90'}`}>{totalAttempts} Tests</span>
                  </div>
                  <div className={`flex items-center space-x-2 rounded-full px-3 py-2 ${
                    darkMode ? 'bg-white/10' : 'bg-white/20'
                  }`}>
                    <Star size={16} className={darkMode ? 'text-yellow-400' : 'text-yellow-200'} />
                    <span className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white' : 'text-white/90'}`}>{averageScore}% Avg</span>
                  </div>
                  <div className={`flex items-center space-x-2 rounded-full px-3 py-2 ${
                    darkMode ? 'bg-white/10' : 'bg-white/20'
                  }`}>
                    <Zap size={16} className={darkMode ? 'text-purple-400' : 'text-purple-200'} />
                    <span className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white' : 'text-white/90'}`}>Level {Math.floor(totalAttempts / 5) + 1}</span>
                  </div>
                </div>
              </div>
              
              {/* Satyam Image */}
              <div className="relative">
                <div className={`w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 float-animation pulse-glow ${
                  darkMode ? 'border-white/20' : 'border-white/30'
                }`}>
                  <img 
                    src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400" 
                    alt="Satyam" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                  darkMode 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                    : 'bg-gradient-to-r from-yellow-300 to-orange-400'
                }`}>
                  <GraduationCap size={16} className="text-white" />
                </div>
                {/* Additional sparkles */}
                <div className={`absolute -top-4 -left-4 w-6 h-6 rounded-full flex items-center justify-center ${
                  darkMode 
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500' 
                    : 'bg-gradient-to-r from-pink-300 to-purple-400'
                }`}>
                  <Star size={12} className="text-white" />
                </div>
                <div className={`absolute -bottom-4 -right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                  darkMode 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                    : 'bg-gradient-to-r from-cyan-300 to-blue-400'
                }`}>
                  <Zap size={12} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl p-4 md:p-6 border ${
            darkMode 
              ? 'glass-dark border-white/10' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Total Tests</p>
                <p className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-4 md:p-6 border ${
            darkMode 
              ? 'glass-dark border-white/10' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Avg Score</p>
                <p className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
          
          <button
            onClick={handleStartTest}
            className={`w-full rounded-2xl p-4 md:p-6 border transition-all duration-300 group ${
              darkMode 
                ? 'glass-dark border-white/10 hover:border-white/20' 
                : 'bg-white/80 backdrop-blur-lg border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-3 md:p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Play size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm md:text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Take New Test</p>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                    {isOnline ? 'Start practicing now' : 'Internet required to start'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isOnline && <AlertCircle size={16} className={darkMode ? 'text-red-400' : 'text-red-500'} />}
                <div className={`text-lg md:text-2xl group-hover:translate-x-2 transition-transform ${darkMode ? 'text-white' : 'text-gray-900'}`}>→</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className={`w-full rounded-2xl p-4 md:p-6 border transition-all duration-300 group ${
              darkMode 
                ? 'glass-dark border-white/10 hover:border-white/20' 
                : 'bg-white/80 backdrop-blur-lg border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Award size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm md:text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>View Progress</p>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Check your performance</p>
                </div>
              </div>
              <div className={`text-lg md:text-2xl group-hover:translate-x-2 transition-transform ${darkMode ? 'text-white' : 'text-gray-900'}`}>→</div>
            </div>
          </button>
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="space-y-4">
            <h2 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Attempts</h2>
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className={`rounded-2xl p-4 border ${
                  darkMode 
                    ? 'glass-dark border-white/10' 
                    : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{attempt.testName}</p>
                      <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                        {new Date(attempt.date).toLocaleDateString()}
                        <span className="ml-2 text-xs">
                          {new Date(attempt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                        {attempt.percentage}%
                      </p>
                      <p className={`text-xs font-medium ${
                        darkMode 
                          ? 'text-purple-400' 
                          : 'text-purple-600'
                      }`}>
                        {attempt.score}/{attempt.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fun Section */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className={`absolute inset-0 gradient-animate ${
            darkMode 
              ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400'
          }`}></div>
          <div className={`relative rounded-2xl p-4 md:p-6 border ${
            darkMode 
              ? 'glass-dark border-white/10' 
              : 'bg-white/20 backdrop-blur-lg border-white/30'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Smile size={20} className="text-white" />
              <h3 className="font-bold text-white text-sm md:text-lg">Joke of the Day</h3>
            </div>
            <p className="text-white leading-relaxed text-xs md:text-sm">{joke}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;