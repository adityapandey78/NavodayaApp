import React, { useState, useEffect } from 'react';
import { Shield, Upload, Eye, EyeOff, Plus, Trash2, Save, X, FileText, Database, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { testService, networkService } from '../lib/supabase';
import { TestData, Question, Section } from '../types/quiz';

export default function Admin() {
  const { user } = useAuth();
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const { darkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin-logged-in') === 'true';
  });
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [tests, setTests] = useState<any[]>([]);
  const [showTsUpload, setShowTsUpload] = useState(false);
  const [tsCode, setTsCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check connection status with better detection
  const checkConnectionStatus = async () => {
    setConnectionStatus('checking');
    
    try {
      if (!navigator.onLine) {
        setConnectionStatus('disconnected');
        return;
      }

      // Test Supabase connection
      const canConnect = await networkService.checkSupabaseConnection(5000);
      setConnectionStatus(canConnect ? 'connected' : 'disconnected');
      
      if (canConnect) {
        console.log('Database connection verified');
      } else {
        console.warn('Database connection failed');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  // Check connection on mount and when online status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectionStatus();
      if (isLoggedIn) {
        setTimeout(() => loadTests(), 1000);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
      console.warn('Admin offline - functions require internet');
    };

    // Initial check
    if (isLoggedIn) {
      checkConnectionStatus();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isLoggedIn]);

  // Load tests from Supabase (admin always requires online)
  const loadTests = async () => {
    if (!isLoggedIn) return;
    
    if (connectionStatus !== 'connected') {
      console.error('Database connection required for admin functions');
      return;
    }
    
    setLoading(true);
    
    try {
      const supabaseTests = await testService.getAllTests();
      
      const formattedTests = supabaseTests.map(test => ({
        id: test.id,
        testType: test.test_type,
        testName: test.test_name,
        testNameHi: test.test_name_hi,
        totalMarks: test.total_marks,
        testDate: test.test_date,
        durationInMinutes: test.duration_in_minutes,
        isLive: test.is_live,
        sections: test.sections
      }));
      
      setTests(formattedTests);
      console.log(`Loaded ${formattedTests.length} tests from database`);
      
    } catch (error: any) {
      console.error('Error loading tests:', error);
      console.error(`Failed to load tests: ${error.message}`);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && connectionStatus === 'connected') {
      loadTests();
    }
  }, [isLoggedIn, connectionStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      showError('Internet connection required for admin login');
      return;
    }
    
    // Check connection before allowing login
    await checkConnectionStatus();
    
    if (connectionStatus !== 'connected') {
      showError('Cannot connect to database. Please check your internet connection.');
      return;
    }
    
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsLoggedIn(true);
      localStorage.setItem('admin-logged-in', 'true');
      showSuccess('Admin login successful');
    } else {
      showError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin-logged-in');
    setCredentials({ username: '', password: '' });
    setTests([]);
    console.log('Logged out successfully');
  };

  const toggleTestStatus = async (testId: string) => {
    if (connectionStatus !== 'connected') {
      showError('Database connection required for this action');
      return;
    }

    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const newStatus = !test.isLive;

    try {
      const success = await testService.toggleTestStatus(testId, newStatus);
      if (success) {
        setTests(prev => prev.map(t => 
          t.id === testId ? { ...t, isLive: newStatus } : t
        ));
        showSuccess(`Test ${newStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error toggling test status:', error);
      showError(`Failed to update test status: ${error.message}`);
    }
  };

  const deleteTest = async (testId: string) => {
    if (connectionStatus !== 'connected') {
      showError('Database connection required for this action');
      return;
    }

    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;

    try {
      const success = await testService.deleteTest(testId);
      if (success) {
        setTests(prev => prev.filter(t => t.id !== testId));
        showSuccess('Test deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting test:', error);
      showError(`Failed to delete test: ${error.message}`);
    }
  };

  const handleTsUpload = async () => {
    if (connectionStatus !== 'connected') {
      showError('Database connection required to create tests');
      return;
    }

    try {
      const cleanCode = tsCode.replace(/^export\s+/, '').trim();
      const func = new Function('return ' + cleanCode);
      const testData = func();
      
      if (!testData || typeof testData !== 'object') {
        throw new Error('Invalid test data format');
      }

      const requiredFields = ['testType', 'testName', 'durationInMinutes', 'sections'];
      for (const field of requiredFields) {
        if (!testData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const newTest = {
        id: testData.id || `test-${Date.now()}`,
        testType: testData.testType,
        testName: testData.testName,
        testNameHi: testData.testNameHi || testData.testName,
        totalMarks: 0,
        testDate: testData.testDate || new Date().toISOString().split('T')[0],
        durationInMinutes: testData.durationInMinutes,
        isLive: testData.isLive !== false,
        sections: testData.sections.map((section: any, sectionIndex: number) => ({
          name: section.name,
          nameHi: section.nameHi || section.name,
          questions: section.questions.map((q: any, qIndex: number) => ({
            id: q.id || `q${sectionIndex + 1}_${qIndex + 1}`,
            question: q.question,
            questionHi: q.questionHi || q.question,
            options: q.options,
            optionsHi: q.optionsHi || q.options,
            correctAnswer: q.correctAnswer || q.answer,
            marks: q.marks || 2
          }))
        }))
      };

      newTest.totalMarks = newTest.sections.reduce((total, section) => 
        total + section.questions.reduce((sectionTotal, question) => sectionTotal + question.marks, 0), 0
      );

      const result = await testService.createTest(newTest);
      if (result) {
        const formattedTest = {
          id: result.id,
          testType: result.test_type,
          testName: result.test_name,
          testNameHi: result.test_name_hi,
          totalMarks: result.total_marks,
          testDate: result.test_date,
          durationInMinutes: result.duration_in_minutes,
          isLive: result.is_live,
          sections: result.sections
        };
        setTests(prev => [...prev, formattedTest]);
        showSuccess(`Test "${newTest.testName}" created successfully with ${newTest.totalMarks} marks!`);
      }

      setTsCode('');
      setShowTsUpload(false);

    } catch (error: any) {
      console.error('Error creating test:', error);
      showError(`Error creating test: ${error.message}`);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'checking': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Database Connected';
      case 'disconnected': return 'Database Disconnected';
      case 'checking': return 'Checking Connection...';
      default: return 'Unknown Status';
    }
  };

  const sampleTestData = `const testData = {
  id: "sample-test-1",
  testType: "navodaya", // or "sainik"
  testName: "Sample Mental Ability Test",
  testNameHi: "नमूना मानसिक योग्यता परीक्षा",
  durationInMinutes: 30,
  isLive: true,
  sections: [
    {
      name: "Mental Ability",
      nameHi: "मानसिक योग्यता",
      questions: [
        {
          id: "q1",
          question: "Complete the series: 2, 4, 8, 16, __?",
          questionHi: "शृंखला पूरी करें: 2, 4, 8, 16, __?",
          options: ["24", "32", "36", "30"],
          optionsHi: ["24", "32", "36", "30"],
          correctAnswer: "32",
          marks: 2
        }
      ]
    }
  ]
};`;

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode 
          ? 'bg-black' 
          : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
      }`}>
        <div className={`max-w-md w-full rounded-2xl p-6 md:p-8 border shadow-2xl ${
          darkMode 
            ? 'bg-white/10 backdrop-blur-lg border-white/20' 
            : 'bg-white/20 backdrop-blur-lg border-white/30'
        }`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-white/80 mt-2">
              Enter your credentials to access the admin panel
            </p>
            <div className="flex items-center justify-center space-x-2 mt-3">
              {connectionStatus === 'checking' && (
                <>
                  <RefreshCw size={16} className="text-yellow-300 animate-spin" />
                  <span className="text-yellow-200 text-sm">Checking connection...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <Database size={16} className="text-green-300" />
                  <span className="text-green-200 text-sm">Database Ready</span>
                </>
              )}
              {connectionStatus === 'disconnected' && (
                <>
                  <AlertCircle size={16} className="text-red-300" />
                  <span className="text-red-200 text-sm">Connection Failed</span>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/60"
                required
                disabled={connectionStatus !== 'connected'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/60"
                required
                disabled={connectionStatus !== 'connected'}
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={connectionStatus !== 'connected'}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                {connectionStatus === 'connected' ? 'Login' : 'Connection Required'}
              </button>
              <button
                type="button"
                onClick={checkConnectionStatus}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                title="Refresh Connection"
              >
                <RefreshCw size={20} className={connectionStatus === 'checking' ? 'animate-spin' : ''} />
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-white/80">
              <strong>Demo Credentials:</strong><br />
              Username: admin<br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-black' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/80">Manage tests and configurations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Database size={20} className={getConnectionStatusColor()} />
              <span className="text-white font-medium">{getConnectionStatusText()}</span>
              <button
                onClick={checkConnectionStatus}
                className="p-1 hover:bg-white/10 rounded"
                title="Refresh Connection"
              >
                <RefreshCw size={16} className={`text-white/60 hover:text-white ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Connection Warning */}
        {connectionStatus !== 'connected' && (
          <div className={`rounded-2xl p-4 border ${
            darkMode 
              ? 'glass-dark border-red-500/30' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              <AlertCircle size={24} className={darkMode ? 'text-red-400' : 'text-red-600'} />
              <div>
                <p className={`font-bold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>Database Connection Required</p>
                <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  {connectionStatus === 'checking' 
                    ? 'Checking database connection...' 
                    : 'Admin functions require a stable database connection. Please check your internet and try refreshing.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Management */}
        <div className={`rounded-2xl p-4 md:p-6 border ${
          darkMode 
            ? 'glass-dark border-white/20' 
            : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Test Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTsUpload(true)}
                disabled={connectionStatus !== 'connected'}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <FileText size={20} />
                <span>Upload Test</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${
                darkMode ? 'border-white/30 border-t-white' : 'border-gray-300 border-t-gray-600'
              }`}></div>
              <p className={darkMode ? 'text-white/80' : 'text-gray-600'}>Loading tests...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                  darkMode ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        test.isLive ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      <div>
                        <h3 className={`font-bold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{test.testName}</h3>
                        <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                          {test.testType.charAt(0).toUpperCase() + test.testType.slice(1)} • {test.totalMarks} marks • {test.durationInMinutes} min • {test.sections.length} sections
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleTestStatus(test.id)}
                      disabled={connectionStatus !== 'connected'}
                      className={`p-2 rounded-lg transition-colors ${
                        test.isLive 
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      } disabled:opacity-50`}
                      title={test.isLive ? 'Hide Test' : 'Show Test'}
                    >
                      {test.isLive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    
                    <button
                      onClick={() => deleteTest(test.id)}
                      disabled={connectionStatus !== 'connected'}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      title="Delete Test"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {tests.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className={darkMode ? 'text-white/80' : 'text-gray-600'}>
                    {connectionStatus === 'connected' ? 'No tests found' : 'Connect to database to load tests'}
                  </p>
                  {connectionStatus === 'connected' && (
                    <p className={`text-sm mt-2 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Upload a test to get started</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TS Code Upload Modal */}
        {showTsUpload && (
          <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
            darkMode ? 'bg-black/80' : 'bg-gray-900/80'
          }`}>
            <div className={`rounded-2xl p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${
              darkMode 
                ? 'glass-dark border-white/20' 
                : 'bg-white border-gray-200 shadow-2xl'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload Test to Database
                </h2>
                <button
                  onClick={() => {
                    setShowTsUpload(false);
                    setTsCode('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={20} className={darkMode ? 'text-white' : 'text-gray-600'} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    Paste your test data here:
                  </label>
                  <textarea
                    value={tsCode}
                    onChange={(e) => setTsCode(e.target.value)}
                    placeholder={sampleTestData}
                    className={`w-full h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono text-sm ${
                      darkMode 
                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className={`rounded-lg p-4 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sample Format:</h3>
                  <pre className={`text-xs overflow-x-auto ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>
                    {sampleTestData}
                  </pre>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowTsUpload(false);
                      setTsCode('');
                    }}
                    className={`px-4 py-2 md:px-6 md:py-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-white/20 hover:bg-white/30 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTsUpload}
                    disabled={!tsCode.trim() || connectionStatus !== 'connected'}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-medium transition-all duration-300 text-sm md:text-base"
                  >
                    <Upload size={20} />
                    <span>{connectionStatus === 'connected' ? 'Save to Database' : 'Connection Required'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Total Tests</p>
            <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tests.length}</p>
          </div>
          
          <div className={`rounded-xl p-4 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Live Tests</p>
            <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {tests.filter(t => t.isLive).length}
            </p>
          </div>
          
          <div className={`rounded-xl p-4 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Navodaya Tests</p>
            <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {tests.filter(t => t.testType === 'navodaya').length}
            </p>
          </div>
          
          <div className={`rounded-xl p-4 border ${
            darkMode 
              ? 'glass-dark border-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
          }`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>Sainik Tests</p>
            <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
              {tests.filter(t => t.testType === 'sainik').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );