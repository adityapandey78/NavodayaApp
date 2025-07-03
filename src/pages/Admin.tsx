import React, { useState, useEffect } from 'react';
import { Shield, Upload, Eye, EyeOff, Plus, Trash2, Save, X, FileText } from 'lucide-react';
import { TestData, Question, Section } from '../types/quiz';

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [tests, setTests] = useState<TestData[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const [showAddTest, setShowAddTest] = useState(false);
  const [editingTest, setEditingTest] = useState<TestData | null>(null);
  const [showTsUpload, setShowTsUpload] = useState(false);
  const [tsCode, setTsCode] = useState('');

  // Load tests from localStorage on component mount
  useEffect(() => {
    const loadTests = () => {
      try {
        const savedTests = localStorage.getItem('admin-tests');
        if (savedTests) {
          const parsedTests = JSON.parse(savedTests);
          if (Array.isArray(parsedTests)) {
            setTests(parsedTests);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading tests:', error);
      }
      
      // Load default tests if no saved tests
      import('../data/testData').then(module => {
        setTests(module.availableTests);
        localStorage.setItem('admin-tests', JSON.stringify(module.availableTests));
      }).catch(error => {
        console.error('Error loading default tests:', error);
        setTests([]);
      });
    };

    loadTests();
  }, []);

  // Save tests to localStorage whenever tests change
  useEffect(() => {
    if (tests.length > 0) {
      localStorage.setItem('admin-tests', JSON.stringify(tests));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('testsUpdated'));
    }
  }, [tests]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const toggleTestStatus = (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, isLive: !test.isLive } : test
    ));
  };

  const deleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      setTests(prev => prev.filter(test => test.id !== testId));
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This will remove all tests, user data, and settings. This action cannot be undone.')) {
      localStorage.clear();
      setTests([]);
      alert('All data has been cleared successfully.');
      window.location.reload();
    }
  };

  const createNewTest = (): TestData => ({
    id: `test-${Date.now()}`,
    testType: 'navodaya',
    testName: 'New Test',
    testNameHi: 'नया टेस्ट',
    totalMarks: 0,
    testDate: new Date().toISOString().split('T')[0],
    durationInMinutes: 60,
    isLive: false,
    sections: [
      {
        name: 'Section 1',
        nameHi: 'भाग 1',
        questions: [
          {
            id: 'q1',
            question: 'Sample question?',
            questionHi: 'नमूना प्रश्न?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            optionsHi: ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D'],
            correctAnswer: 'Option A',
            marks: 2
          }
        ]
      }
    ]
  });

  const handleAddTest = () => {
    const newTest = createNewTest();
    setEditingTest(newTest);
    setShowAddTest(true);
  };

  const handleEditTest = (test: TestData) => {
    setEditingTest({ ...test });
    setShowAddTest(true);
  };

  const handleSaveTest = () => {
    if (!editingTest) return;

    // Calculate total marks
    const totalMarks = editingTest.sections.reduce((total, section) => 
      total + section.questions.reduce((sectionTotal, question) => sectionTotal + question.marks, 0), 0
    );

    const updatedTest = { ...editingTest, totalMarks };

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

    setShowAddTest(false);
    setEditingTest(null);
  };

  const handleTsUpload = () => {
    try {
      // Remove export statement and evaluate the code
      const cleanCode = tsCode.replace(/^export\s+/, '').trim();
      
      // Create a function to safely evaluate the code
      const func = new Function('return ' + cleanCode);
      const testData = func();
      
      if (!testData || typeof testData !== 'object') {
        throw new Error('Invalid test data format');
      }

      // Validate required fields
      const requiredFields = ['testType', 'testName', 'durationInMinutes', 'sections'];
      for (const field of requiredFields) {
        if (!testData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Generate ID and calculate total marks
      const newTest: TestData = {
        id: testData.id || `test-${Date.now()}`,
        testType: testData.testType,
        testName: testData.testName,
        testNameHi: testData.testNameHi || testData.testName,
        totalMarks: 0, // Will be calculated below
        testDate: testData.testDate || new Date().toISOString().split('T')[0],
        durationInMinutes: testData.durationInMinutes,
        isLive: testData.isLive || false,
        sections: testData.sections.map((section: any, sectionIndex: number) => ({
          name: section.name,
          nameHi: section.nameHi || section.name,
          questions: section.questions.map((q: any, qIndex: number) => ({
            id: q.id || `q${sectionIndex + 1}_${qIndex + 1}`,
            question: q.question,
            questionHi: q.questionHi || q.question,
            options: q.options,
            optionsHi: q.optionsHi || q.options,
            correctAnswer: q.correctAnswer || q.answer, // Support both formats
            marks: q.marks || 2
          }))
        }))
      };

      // Calculate total marks
      newTest.totalMarks = newTest.sections.reduce((total, section) => 
        total + section.questions.reduce((sectionTotal, question) => sectionTotal + question.marks, 0), 0
      );

      // Add to tests
      setTests(prev => [...prev, newTest]);
      setTsCode('');
      setShowTsUpload(false);
      alert(`Test "${newTest.testName}" has been successfully created with ${newTest.totalMarks} marks!`);

    } catch (error) {
      alert(`Error parsing test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addSection = () => {
    if (!editingTest) return;
    
    const newSection: Section = {
      name: `Section ${editingTest.sections.length + 1}`,
      nameHi: `भाग ${editingTest.sections.length + 1}`,
      questions: []
    };

    setEditingTest(prev => prev ? {
      ...prev,
      sections: [...prev.sections, newSection]
    } : null);
  };

  const addQuestion = (sectionIndex: number) => {
    if (!editingTest) return;

    const newQuestion: Question = {
      id: `q${Date.now()}`,
      question: 'New question?',
      questionHi: 'नया प्रश्न?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      optionsHi: ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D'],
      correctAnswer: 'Option A',
      marks: 2
    };

    setEditingTest(prev => {
      if (!prev) return null;
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        questions: [...newSections[sectionIndex].questions, newQuestion]
      };
      return { ...prev, sections: newSections };
    });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, field: string, value: any) => {
    if (!editingTest) return;

    setEditingTest(prev => {
      if (!prev) return null;
      const newSections = [...prev.sections];
      const newQuestions = [...newSections[sectionIndex].questions];
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions };
      return { ...prev, sections: newSections };
    });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!editingTest) return;

    setEditingTest(prev => {
      if (!prev) return null;
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        questions: newSections[sectionIndex].questions.filter((_, i) => i !== questionIndex)
      };
      return { ...prev, sections: newSections };
    });
  };

  const removeSection = (sectionIndex: number) => {
    if (!editingTest) return;

    setEditingTest(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.filter((_, i) => i !== sectionIndex)
      };
    });
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
    },
    {
      name: "Arithmetic",
      nameHi: "अंकगणित",
      questions: [
        {
          id: "q3",
          question: "What is 15% of 200?",
          questionHi: "200 का 15% क्या है?",
          options: ["25", "30", "35", "40"],
          optionsHi: ["25", "30", "35", "40"],
          correctAnswer: "30",
          marks: 2
        }
      ]
    }
  ]
};`;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your credentials to access the admin panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
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
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage tests and configurations</p>
        </div>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Test Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Management</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowTsUpload(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText size={20} />
              <span>Upload TS Code</span>
            </button>
            <button
              onClick={handleAddTest}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              <span>Add Test</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    test.isLive ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{test.testName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                  title={test.isLive ? 'Hide Test' : 'Show Test'}
                >
                  {test.isLive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                
                <button
                  onClick={() => handleEditTest(test)}
                  className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  title="Edit Test"
                >
                  <Upload size={16} />
                </button>
                
                <button
                  onClick={() => deleteTest(test.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete Test"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TS Code Upload Modal */}
      {showTsUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Test from TypeScript Code</h2>
              <button
                onClick={() => {
                  setShowTsUpload(false);
                  setTsCode('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste your TypeScript test data here:
                </label>
                <textarea
                  value={tsCode}
                  onChange={(e) => setTsCode(e.target.value)}
                  placeholder={sampleTestData}
                  className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sample Format:</h3>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                  {sampleTestData}
                </pre>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowTsUpload(false);
                    setTsCode('');
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTsUpload}
                  disabled={!tsCode.trim()}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Upload size={20} />
                  <span>Create Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Editor Modal - keeping existing implementation */}
      {showAddTest && editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {tests.find(t => t.id === editingTest.id) ? 'Edit Test' : 'Add New Test'}
              </h2>
              <button
                onClick={() => {
                  setShowAddTest(false);
                  setEditingTest(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Test Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={editingTest.testName}
                    onChange={(e) => setEditingTest(prev => prev ? { ...prev, testName: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={editingTest.testNameHi || ''}
                    onChange={(e) => setEditingTest(prev => prev ? { ...prev, testNameHi: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Type
                  </label>
                  <select
                    value={editingTest.testType}
                    onChange={(e) => setEditingTest(prev => prev ? { ...prev, testType: e.target.value as 'navodaya' | 'sainik' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="navodaya">Navodaya</option>
                    <option value="sainik">Sainik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingTest.durationInMinutes}
                    onChange={(e) => setEditingTest(prev => prev ? { ...prev, durationInMinutes: parseInt(e.target.value) } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowAddTest(false);
                    setEditingTest(null);
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTest}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save size={20} />
                  <span>Save Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Data Management</h2>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            This will permanently delete all data including tests, user attempts, and settings. This action cannot be undone.
          </p>
          <button
            onClick={clearAllData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Live Tests</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {tests.filter(t => t.isLive).length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Navodaya Tests</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {tests.filter(t => t.testType === 'navodaya').length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sainik Tests</p>
          <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
            {tests.filter(t => t.testType === 'sainik').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;