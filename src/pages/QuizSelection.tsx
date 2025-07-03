import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, Users, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Connection Status */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-lg rounded-2xl">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {isOnline ? (
                <Wifi size={20} className="text-green-300" />
              ) : (
                <WifiOff size={20} className="text-red-300" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-200' : 'text-red-200'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">Choose Your Test</h1>
            <p className="text-white/80 mt-2">
              {isOnline 
                ? 'Select a test below to start your preparation'
                : 'Using cached tests - results will be saved locally'
              }
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle size={24} className="text-red-300" />
              <h3 className="text-xl font-bold text-red-200">Unable to Load Tests</h3>
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadTests}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Navodaya Tests */}
        {navodayaTests.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl">
                <BookOpen size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Navodaya Vidyalaya</h2>
            </div>
            
            <div className="grid gap-6">
              {navodayaTests.map((test) => (
                <div key={test.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {test.testName}
                      </h3>
                      <div className="flex items-center space-x-6 text-white/80 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock size={18} />
                          <span className="font-medium">{test.durationInMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={18} />
                          <span className="font-medium">{test.totalMarks} marks</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {test.sections && test.sections.map((section: any) => (
                          <span
                            key={section.name}
                            className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => startTest(test.testType, test.id)}
                      className="ml-6 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sainik Tests */}
        {sainikTests.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sainik School</h2>
            </div>
            
            <div className="grid gap-6">
              {sainikTests.map((test) => (
                <div key={test.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {test.testName}
                      </h3>
                      <div className="flex items-center space-x-6 text-white/80 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock size={18} />
                          <span className="font-medium">{test.durationInMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={18} />
                          <span className="font-medium">{test.totalMarks} marks</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {test.sections && test.sections.map((section: any) => (
                          <span
                            key={section.name}
                            className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => startTest(test.testType, test.id)}
                      className="ml-6 bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Tests Available */}
        {(navodayaTests.length === 0 && sainikTests.length === 0) && !error && (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Tests Available</h3>
              <p className="text-white/80 text-lg mb-6">
                {isOnline 
                  ? 'Please check back later or contact administrator'
                  : 'No cached tests available. Please connect to internet to load tests.'
                }
              </p>
              <button
                onClick={loadTests}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
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