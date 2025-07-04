import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, BookOpen, Award, Smile, GraduationCap, Wifi, WifiOff, Upload, AlertCircle, Target, Clock, Star, Zap } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import { useToast } from '../contexts/ToastContext';
import { networkService } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="glass-dark rounded-2xl p-4 border border-red-500/30">
            <div className="flex items-center space-x-3">
              <WifiOff size={20} className="text-red-400" />
              <div>
                <p className="font-bold text-red-200 text-sm md:text-base">No Internet Connection</p>
                <p className="text-red-300 text-xs md:text-sm">You can continue taking tests, but results will be saved locally until connection is restored.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Results Banner */}
        {hasPendingAttempts && (
          <div className="glass-dark rounded-2xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload size={20} className="text-yellow-400" />
                <div>
                  <p className="font-bold text-yellow-200 text-sm md:text-base">Pending Results</p>
                  <p className="text-yellow-300 text-xs md:text-sm">You have test results waiting to be uploaded to the server.</p>
                </div>
              </div>
              <button
                onClick={handleSyncPending}
                disabled={!isOnline}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-black disabled:text-gray-300 px-3 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm"
              >
                {isOnline ? 'Upload Now' : 'No Internet'}
              </button>
            </div>
          </div>
        )}

        {/* Hero Section with Satyam Image */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 gradient-animate"></div>
          <div className="relative glass-dark rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  {isOnline ? (
                    <>
                      <Wifi size={16} className="text-green-400" />
                      <span className="text-green-300 text-xs md:text-sm font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={16} className="text-red-400" />
                      <span className="text-red-300 text-xs md:text-sm font-medium">Offline</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Welcome back, Satyam!
                </h1>
                <p className="text-blue-100 text-base md:text-xl lg:text-2xl mb-4 md:mb-6">Ready to ace your next test?</p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-2">
                    <Target size={16} className="text-cyan-400" />
                    <span className="text-xs md:text-sm font-medium">{totalAttempts} Tests</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-2">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-xs md:text-sm font-medium">{averageScore}% Avg</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-2">
                    <Zap size={16} className="text-purple-400" />
                    <span className="text-xs md:text-sm font-medium">Level {Math.floor(totalAttempts / 5) + 1}</span>
                  </div>
                </div>
              </div>
              
              {/* Satyam Image */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white/20 float-animation pulse-glow">
                  <img 
                    src="/5aca0d6c-7f62-420d-9299-e85108fa6c39.png" 
                    alt="Satyam" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-dark rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs md:text-sm font-medium">Total Tests</p>
                <p className="text-xl md:text-3xl font-bold text-white">{totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs md:text-sm font-medium">Avg Score</p>
                <p className="text-xl md:text-3xl font-bold text-white">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white">Quick Actions</h2>
          
          <button
            onClick={handleStartTest}
            className="w-full glass-dark rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-3 md:p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Play size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-sm md:text-lg">Take New Test</p>
                  <p className="text-white/80 text-xs md:text-sm">
                    {isOnline ? 'Start practicing now' : 'Internet required to start'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isOnline && <AlertCircle size={16} className="text-red-400" />}
                <div className="text-white text-lg md:text-2xl group-hover:translate-x-2 transition-transform">→</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="w-full glass-dark rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Award size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-sm md:text-lg">View Progress</p>
                  <p className="text-white/80 text-xs md:text-sm">Check your performance</p>
                </div>
              </div>
              <div className="text-white text-lg md:text-2xl group-hover:translate-x-2 transition-transform">→</div>
            </div>
          </button>
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white">Recent Attempts</h2>
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="glass-dark rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm md:text-base">{attempt.testName}</p>
                      <p className="text-white/80 text-xs md:text-sm">
                        {new Date(attempt.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg md:text-xl font-bold text-cyan-400">
                        {attempt.percentage}%
                      </p>
                      <p className="text-white/80 text-xs md:text-sm">
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
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 gradient-animate"></div>
          <div className="relative glass-dark rounded-2xl p-4 md:p-6 border border-white/10">
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