import React, { useState, useEffect } from 'react';
import { Shield, Upload, Eye, EyeOff, Plus, Trash2, Save, X, FileText, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { testService } from '../lib/supabase';
import { TestData, Question, Section } from '../types/quiz';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [showAddTest, setShowAddTest] = useState(false);
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [showTsUpload, setShowTsUpload] = useState(false);
  const [tsCode, setTsCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Always try to use database first, then fallback to localStorage
  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      try {
        // Always try Supabase first
        const supabaseTests = await testService.getAllTests();
        if (supabaseTests.length > 0) {
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
        } else {
          // Fallback to localStorage only if no database tests
          const savedTests = localStorage.getItem('admin-tests');
          if (savedTests) {
            const parsedTests = JSON.parse(savedTests);
            setTests(Array.isArray(parsedTests) ? parsedTests : []);
          } else {
            // Load default tests and save them to database
            const module = await import('../data/testData');
            const defaultTests = module.availableTests;
            setTests(defaultTests);
            
            // Save default tests to database
            for (const test of defaultTests) {
              await testService.createTest(test);
            }
          }
        }
      } catch (error) {
        console.error('Error loading tests:', error);
        // Fallback to localStorage on error
        const savedTests = localStorage.getItem('admin-tests');
        if (savedTests) {
          const parsedTests = JSON.parse(savedTests);
          setTests(Array.isArray(parsedTests) ? parsedTests : []);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      loadTests();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const toggleTestStatus = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const newStatus = !test.isLive;

    // Always try to update in database first
    const success = await testService.toggleTestStatus(testId, newStatus);
    if (success) {
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, isLive: newStatus } : t
      ));
      // Trigger event to update other components
      window.dispatchEvent(new CustomEvent('testsUpdated'));
    } else {
      // Fallback to localStorage
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, isLive: newStatus } : t
      ));
      localStorage.setItem('admin-tests', JSON.stringify(tests.map(t => 
        t.id === testId ? { ...t, isLive: newStatus } : t
      )));
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    // Always try to delete from database first
    const success = await testService.deleteTest(testId);
    if (success) {
      setTests(prev => prev.filter(t => t.id !== testId));
      window.dispatchEvent(new CustomEvent('testsUpdated'));
    } else {
      // Fallback to localStorage
      setTests(prev => prev.filter(t => t.id !== testId));
      localStorage.setItem('admin-tests', JSON.stringify(tests.filter(t => t.id !== testId)));
    }
  };

  const handleSaveTest = async () => {
    if (!editingTest) return;

    // Calculate total marks
    const totalMarks = editingTest.sections.reduce((total: number, section: any) => 
      total + section.questions.reduce((sectionTotal: number, question: any) => sectionTotal + question.marks, 0), 0
    );

    const updatedTest = { ...editingTest, totalMarks };

    // Always try to save to database first
    let result;
    const existingTest = tests.find(t => t.id === updatedTest.id);
    
    try {
      if (existingTest) {
        result = await testService.updateTest(updatedTest.id, updatedTest);
      } else {
        result = await testService.createTest(updatedTest);
      }

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

        setTests(prev => {
          const existingIndex = prev.findIndex(t => t.id === formattedTest.id);
          if (existingIndex >= 0) {
            const newTests = [...prev];
            newTests[existingIndex] = formattedTest;
            return newTests;
          } else {
            return [...prev, formattedTest];
          }
        });

        alert('Test saved to database successfully!');
        window.dispatchEvent(new CustomEvent('testsUpdated'));
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Database save failed:', error);
      // Fallback to localStorage
      setTests(prev => {
        const existingIndex = prev.findIndex(t => t.id === updatedTest.id);
        if (existingIndex >= 0) {
          const newTests = [...prev];
          newTests[existingIndex] = updatedTest;
          return newTests;
        } else {
          return [...prev, updatedTest];
        }
      });
      localStorage.setItem('admin-tests', JSON.stringify(tests));
      alert('Test saved locally (database unavailable)');
    }

    setShowAddTest(false);
    setEditingTest(null);
  };

  const handleTsUpload = async () => {
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
        isLive: testData.isLive !== false, // Default to true
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

      // Always try to save to database first
      try {
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
          alert(`Test "${newTest.testName}" created in database with ${newTest.totalMarks} marks!`);
          window.dispatchEvent(new CustomEvent('testsUpdated'));
        } else {
          throw new Error('Failed to save to database');
        }
      } catch (error) {
        console.error('Database save failed:', error);
        // Fallback to localStorage
        setTests(prev => [...prev, newTest]);
        localStorage.setItem('admin-tests', JSON.stringify([...tests, newTest]));
        alert(`Test "${newTest.testName}" created locally with ${newTest.totalMarks} marks! (Database unavailable)`);
      }

      setTsCode('');
      setShowTsUpload(false);

    } catch (error) {
      alert(`Error parsing test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        },
        {
          id: "q2",
          question: "If BOOK is coded as CPPL, then HELP is coded as:",
          questionHi: "यदि BOOK को CPPL के रूप में कोड किया जाता है, तो HELP को कोड किया जाएगा:",
          options: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
          optionsHi: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
          correctAnswer: "IFMQ",
          marks: 2
        }
      ]
    }
  ]
};`;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-white/80 mt-2">
              Enter your credentials to access the admin panel
            </p>
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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              Login
            </button>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/80">Manage tests and configurations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Database size={20} className="text-green-400" />
              <span className="text-white font-medium">Database Mode</span>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Test Management */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Test Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTsUpload(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <FileText size={20} />
                <span>Upload Test</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80">Loading tests...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        test.isLive ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      <div>
                        <h3 className="font-bold text-white">{test.testName}</h3>
                        <p className="text-white/80 text-sm">
                          {test.testType.charAt(0).toUpperCase() + test.testType.slice(1)} • {test.totalMarks} marks • {test.durationInMinutes} min • {test.sections.length} sections
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleTestStatus(test.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        test.isLive 
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      }`}
                      title={test.isLive ? 'Hide Test' : 'Show Test'}
                    >
                      {test.isLive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete Test"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TS Code Upload Modal */}
        {showTsUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Test to Database</h2>
                <button
                  onClick={() => {
                    setShowTsUpload(false);
                    setTsCode('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Paste your test data here (will be saved to database):
                  </label>
                  <textarea
                    value={tsCode}
                    onChange={(e) => setTsCode(e.target.value)}
                    placeholder={sampleTestData}
                    className="w-full h-64 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/40 font-mono text-sm"
                  />
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Sample Format:</h3>
                  <pre className="text-xs text-white/80 overflow-x-auto">
                    {sampleTestData}
                  </pre>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowTsUpload(false);
                      setTsCode('');
                    }}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTsUpload}
                    disabled={!tsCode.trim()}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    <Upload size={20} />
                    <span>Save to Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-white/80 text-sm">Total Tests</p>
            <p className="text-2xl font-bold text-white">{tests.length}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-white/80 text-sm">Live Tests</p>
            <p className="text-2xl font-bold text-green-400">
              {tests.filter(t => t.isLive).length}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-white/80 text-sm">Navodaya Tests</p>
            <p className="text-2xl font-bold text-cyan-400">
              {tests.filter(t => t.testType === 'navodaya').length}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-white/80 text-sm">Sainik Tests</p>
            <p className="text-2xl font-bold text-pink-400">
              {tests.filter(t => t.testType === 'sainik').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;