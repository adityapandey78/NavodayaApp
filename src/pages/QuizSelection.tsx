import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, Users, Clock, AlertCircle, Wifi, WifiOff, Star, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { testService, networkService } from '../lib/supabase';

const QuizSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showWarning, showInfo } = useToast();
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tests = await testService.getLiveTests();
      setAvailableTests(tests);
      
      if (tests.length > 0) {
        if (networkService.isOnline()) {
          showInfo('Tests loaded from database');
        } else {
          showWarning('Using cached tests - you are offline');
        }
      }
      
    } catch (error: any) {
      console.error('Error loading tests:', error);
      setError(error.message);
      setAvailableTests([]);
      
      if (error.message.includes('internet') || error.message.includes('connection')) {
        showError('No internet connection. Please connect to load tests.');
      } else {
        showError('Failed to load tests. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTests();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      showInfo('Back online! Refreshing tests...');
      loadTests();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showWarning('You are now offline. Using cached data if available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navodayaTests = availableTests.filter(test => test.testType === 'navodaya');
  const sainikTests = availableTests.filter(test => test.testType === 'sainik');

  const startTest = (testType: string, testId: string) => {
    navigate(`/quiz/${testType}/${testId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm md:text-lg font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="glass-dark rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {isOnline ? (
                <Wifi size={16} className="text-green-400" />
              ) : (
                <WifiOff size={16} className="text-red-400" />
              )}
              <span className={`text-xs md:text-sm font-medium ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-white">Choose Your Test</h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              {isOnline 
                ? 'Select a test below to start your preparation'
                : 'Using cached tests - results will be saved locally'
              }
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="glass-dark rounded-2xl p-4 md:p-6 border border-red-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle size={20} className="text-red-400" />
              <h3 className="text-lg md:text-xl font-bold text-red-300">Unable to Load Tests</h3>
            </div>
            <p className="text-red-300 mb-4 text-sm md:text-base">{error}</p>
            <button
              onClick={loadTests}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold transition-all duration-300 text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Navodaya Tests */}
        {navodayaTests.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <BookOpen size={20} className="text-white" />
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-white">Navodaya Vidyalaya</h2>
            </div>
            
            <div className="grid gap-4 md:gap-6">
              {navodayaTests.map((test) => (
                <div key={test.id} className="glass-dark rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-base md:text-xl font-bold text-white">
                          {test.testName}
                        </h3>
                        <Star size={16} className="text-yellow-400" />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-400 mb-3 md:mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span className="font-medium text-xs md:text-sm">{test.durationInMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={14} />
                          <span className="font-medium text-xs md:text-sm">{test.totalMarks} marks</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap size={14} />
                          <span className="font-medium text-xs md:text-sm">{test.sections?.length || 0} sections</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {test.sections && test.sections.map((section: any) => (
                          <span
                            key={section.name}
                            className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 text-xs md:text-sm rounded-full font-medium border border-blue-500/30"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => startTest(test.testType, test.id)}
                      className="w-full md:w-auto md:ml-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sainik Tests */}
        {sainikTests.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Shield size={20} className="text-white" />
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-white">Sainik School</h2>
            </div>
            
            <div className="grid gap-4 md:gap-6">
              {sainikTests.map((test) => (
                <div key={test.id} className="glass-dark rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-base md:text-xl font-bold text-white">
                          {test.testName}
                        </h3>
                        <Star size={16} className="text-yellow-400" />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-400 mb-3 md:mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span className="font-medium text-xs md:text-sm">{test.durationInMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={14} />
                          <span className="font-medium text-xs md:text-sm">{test.totalMarks} marks</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap size={14} />
                          <span className="font-medium text-xs md:text-sm">{test.sections?.length || 0} sections</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {test.sections && test.sections.map((section: any) => (
                          <span
                            key={section.name}
                            className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs md:text-sm rounded-full font-medium border border-purple-500/30"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => startTest(test.testType, test.id)}
                      className="w-full md:w-auto md:ml-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Tests Available */}
        {(navodayaTests.length === 0 && sainikTests.length === 0) && !error && (
          <div className="text-center py-12 md:py-16">
            <div className="glass-dark rounded-2xl p-8 md:p-12 border border-white/10">
              <div className="w-20 h-20 md:w-24 md:h-24 glass-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-white mb-4">No Tests Available</h3>
              <p className="text-gray-400 text-sm md:text-lg mb-6">
                {isOnline 
                  ? 'Please check back later or contact administrator'
                  : 'No cached tests available. Please connect to internet to load tests.'
                }
              </p>
              <button
                onClick={loadTests}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold transition-all duration-300 text-sm md:text-base"
              >
                {isOnline ? 'Retry Loading' : 'Check Connection'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSelection;