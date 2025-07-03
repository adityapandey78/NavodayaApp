import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, BookOpen, Award, Smile, GraduationCap, Wifi, WifiOff, Upload, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <WifiOff size={24} className="text-red-300" />
              <div>
                <p className="font-bold text-red-200">No Internet Connection</p>
                <p className="text-red-300 text-sm">You can continue taking tests, but results will be saved locally until connection is restored.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Results Banner */}
        {hasPendingAttempts && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload size={24} className="text-yellow-300" />
                <div>
                  <p className="font-bold text-yellow-200">Pending Results</p>
                  <p className="text-yellow-300 text-sm">You have test results waiting to be uploaded to the server.</p>
                </div>
              </div>
              <button
                onClick={handleSyncPending}
                disabled={!isOnline}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-yellow-900 disabled:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isOnline ? 'Upload Now' : 'No Internet'}
              </button>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Satyam!</h1>
              <p className="text-blue-100 mt-2 text-lg">Ready to ace your next test?</p>
              <div className="flex items-center space-x-2 mt-2">
                {isOnline ? (
                  <>
                    <Wifi size={16} className="text-green-300" />
                    <span className="text-green-200 text-sm font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={16} className="text-red-300" />
                    <span className="text-red-200 text-sm font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
              <GraduationCap size={40} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Total Tests</p>
                <p className="text-3xl font-bold text-white">{totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Avg Score</p>
                <p className="text-3xl font-bold text-white">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          
          <button
            onClick={handleStartTest}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl group-hover:scale-110 transition-transform">
                <Play size={28} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Take New Test</p>
                <p className="text-white/80">
                  {isOnline ? 'Start practicing now' : 'Internet required to start'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isOnline && <AlertCircle size={20} className="text-red-300" />}
              <div className="text-white text-2xl group-hover:translate-x-2 transition-transform">→</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl group-hover:scale-110 transition-transform">
                <Award size={28} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">View Progress</p>
                <p className="text-white/80">Check your performance</p>
              </div>
            </div>
            <div className="text-white text-2xl group-hover:translate-x-2 transition-transform">→</div>
          </button>
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Recent Attempts</h2>
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{attempt.testName}</p>
                      <p className="text-white/80 text-sm">
                        {new Date(attempt.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-cyan-300">
                        {attempt.percentage}%
                      </p>
                      <p className="text-white/80 text-sm">
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
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Smile size={24} className="text-white" />
            <h3 className="font-bold text-white text-lg">Joke of the Day</h3>
          </div>
          <p className="text-white leading-relaxed">{joke}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;