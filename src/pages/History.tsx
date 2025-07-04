import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Award, BookOpen, Eye, X, Check, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuiz } from '../contexts/QuizContext';
import { useTheme } from '../contexts/ThemeContext';

const History: React.FC = () => {
  const { testAttempts } = useQuiz();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const chartData = testAttempts.slice(-10).map((attempt, index) => ({
    attempt: index + 1,
    score: attempt.percentage,
    date: new Date(attempt.date).toLocaleDateString()
  }));

  const averageScore = testAttempts.length > 0 
    ? Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / testAttempts.length)
    : 0;

  const bestScore = testAttempts.length > 0 
    ? Math.max(...testAttempts.map(a => a.percentage))
    : 0;

  const navodayaAttempts = testAttempts.filter(a => a.testType === 'navodaya');
  const sainikAttempts = testAttempts.filter(a => a.testType === 'sainik');

  const viewAttemptDetails = (attempt: any) => {
    setSelectedAttempt(attempt);
    setShowDetailModal(true);
  };

  // Function to get test details with all questions
  const getTestDetails = (attempt: any) => {
    // Get actual user answers from the attempt if available
    const actualUserAnswers = attempt.userAnswers || [];
    
    // Create a mapping of question IDs to user answers
    const userAnswerMap = actualUserAnswers.reduce((map: any, answer: any) => {
      map[answer.questionId] = answer;
      return map;
    }, {});

    // Mock data structure - in a real app, this would come from the database
    return {
      sections: [
        {
          name: "Mental Ability",
          questions: [
            {
              id: "q1",
              question: "Complete the series: 2, 4, 8, 16, __?",
              options: ["24", "32", "36", "30"],
              correctAnswer: "32",
              userAnswer: userAnswerMap["q1"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q1"]?.isCorrect || false,
              marks: userAnswerMap["q1"]?.marks || 0
            },
            {
              id: "q2",
              question: "If BOOK is coded as CPPL, then HELP is coded as:",
              options: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
              correctAnswer: "IFMQ",
              userAnswer: userAnswerMap["q2"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q2"]?.isCorrect || false,
              marks: userAnswerMap["q2"]?.marks || 0
            },
            {
              id: "q3",
              question: "Find the odd one out: Dog, Cat, Tiger, Chair",
              options: ["Dog", "Cat", "Tiger", "Chair"],
              correctAnswer: "Chair",
              userAnswer: userAnswerMap["q3"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q3"]?.isCorrect || false,
              marks: userAnswerMap["q3"]?.marks || 0
            },
            {
              id: "q4",
              question: "What comes next in the pattern: A, C, E, G, __?",
              options: ["H", "I", "J", "K"],
              correctAnswer: "I",
              userAnswer: userAnswerMap["q4"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q4"]?.isCorrect || false,
              marks: userAnswerMap["q4"]?.marks || 0
            },
            {
              id: "q5",
              question: "If 3 + 3 = 18, 4 + 4 = 32, then 5 + 5 = ?",
              options: ["50", "45", "40", "55"],
              correctAnswer: "50",
              userAnswer: userAnswerMap["q5"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q5"]?.isCorrect || false,
              marks: userAnswerMap["q5"]?.marks || 0
            },
            {
              id: "q6",
              question: "Which number comes next: 1, 4, 9, 16, __?",
              options: ["20", "25", "30", "36"],
              correctAnswer: "25",
              userAnswer: userAnswerMap["q6"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q6"]?.isCorrect || false,
              marks: userAnswerMap["q6"]?.marks || 0
            },
            {
              id: "q7",
              question: "If all roses are flowers and some flowers are red, then:",
              options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
              correctAnswer: "Cannot be determined",
              userAnswer: userAnswerMap["q7"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q7"]?.isCorrect || false,
              marks: userAnswerMap["q7"]?.marks || 0
            },
            {
              id: "q8",
              question: "Complete: CAT is to KITTEN as DOG is to ___",
              options: ["PUPPY", "BARK", "TAIL", "BONE"],
              correctAnswer: "PUPPY",
              userAnswer: userAnswerMap["q8"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q8"]?.isCorrect || false,
              marks: userAnswerMap["q8"]?.marks || 0
            }
          ]
        },
        {
          name: "Arithmetic",
          questions: [
            {
              id: "q9",
              question: "What is 15% of 200?",
              options: ["25", "30", "35", "40"],
              correctAnswer: "30",
              userAnswer: userAnswerMap["q9"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q9"]?.isCorrect || false,
              marks: userAnswerMap["q9"]?.marks || 0
            },
            {
              id: "q10",
              question: "If x + 5 = 12, then x = ?",
              options: ["6", "7", "8", "9"],
              correctAnswer: "7",
              userAnswer: userAnswerMap["q10"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q10"]?.isCorrect || false,
              marks: userAnswerMap["q10"]?.marks || 0
            },
            {
              id: "q11",
              question: "The area of a rectangle with length 8m and width 5m is:",
              options: ["40 sq m", "26 sq m", "13 sq m", "45 sq m"],
              correctAnswer: "40 sq m",
              userAnswer: userAnswerMap["q11"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q11"]?.isCorrect || false,
              marks: userAnswerMap["q11"]?.marks || 0
            },
            {
              id: "q12",
              question: "What is 25% of 80?",
              options: ["15", "20", "25", "30"],
              correctAnswer: "20",
              userAnswer: userAnswerMap["q12"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q12"]?.isCorrect || false,
              marks: userAnswerMap["q12"]?.marks || 0
            },
            {
              id: "q13",
              question: "If a train travels 60 km in 45 minutes, what is its speed in km/h?",
              options: ["75", "80", "85", "90"],
              correctAnswer: "80",
              userAnswer: userAnswerMap["q13"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q13"]?.isCorrect || false,
              marks: userAnswerMap["q13"]?.marks || 0
            }
          ]
        },
        {
          name: "Language",
          questions: [
            {
              id: "q14",
              question: "Choose the correct synonym for 'Happy':",
              options: ["Sad", "Joyful", "Angry", "Tired"],
              correctAnswer: "Joyful",
              userAnswer: userAnswerMap["q14"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q14"]?.isCorrect || false,
              marks: userAnswerMap["q14"]?.marks || 0
            },
            {
              id: "q15",
              question: "What is the plural of 'Child'?",
              options: ["Childs", "Children", "Childes", "Child"],
              correctAnswer: "Children",
              userAnswer: userAnswerMap["q15"]?.selectedAnswer || "Not answered",
              isCorrect: userAnswerMap["q15"]?.isCorrect || false,
              marks: userAnswerMap["q15"]?.marks || 0
            }
          ]
        }
      ]
    };
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-black text-white' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Test History</h1>
          <p className={`mt-1 text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your performance over time
          </p>
        </div>

        {testAttempts.length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              darkMode 
                ? 'glass-dark' 
                : 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg'
            }`}>
              <BookOpen size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </div>
            <h3 className={`text-base md:text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No Tests Taken Yet
            </h3>
            <p className={`mb-4 text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start by taking your first test
            </p>
            <button
              onClick={() => navigate('/quiz-selection')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base text-white ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              Start Test
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-xl p-4 border ${
                darkMode 
                  ? 'glass-dark border-white/10' 
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tests</p>
                    <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {testAttempts.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border ${
                darkMode 
                  ? 'glass-dark border-white/10' 
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                    <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {averageScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border ${
                darkMode 
                  ? 'glass-dark border-white/10' 
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Award size={16} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Best Score</p>
                    <p className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {bestScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {chartData.length > 0 && (
              <div className={`rounded-xl p-4 md:p-6 border ${
                darkMode 
                  ? 'glass-dark border-white/10' 
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
              }`}>
                <h2 className={`text-base md:text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Performance Chart
                </h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                      <XAxis 
                        dataKey="attempt" 
                        stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                        fontSize={12}
                      />
                      <YAxis 
                        stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                          border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                          borderRadius: '8px',
                          color: darkMode ? '#F9FAFB' : '#1F2937'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke={darkMode ? "#8B5CF6" : "#7C3AED"} 
                        strokeWidth={3}
                        dot={{ fill: darkMode ? '#8B5CF6' : '#7C3AED', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: darkMode ? '#8B5CF6' : '#7C3AED', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Test Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-xl p-4 border ${
                darkMode 
                  ? 'glass-dark border-white/10' 
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
              }`}>
                <h3 className={`font-semibold mb-2 text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Navodaya Tests
                </h3>
                <p className={`text-xl md:text-2xl font-bold ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'
                    : 'text-blue-600'
                }`}>
                  {navodayaAttempts.length}
                </p>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tests Completed
                </p>
              </div>

              <div className={`rounded-xl p-4 border ${
                darkMode 
                  ? 'glass-dark border-white/10' 
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
              }`}>
                <h3 className={`font-semibold mb-2 text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sainik School Tests
                </h3>
                <p className={`text-xl md:text-2xl font-bold ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                    : 'text-purple-600'
                }`}>
                  {sainikAttempts.length}
                </p>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tests Completed
                </p>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className={`rounded-xl p-4 md:p-6 border ${
              darkMode 
                ? 'glass-dark border-white/10' 
                : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
            }`}>
              <h2 className={`text-base md:text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Tests
              </h2>
              <div className="space-y-3">
                {testAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className={`flex items-center justify-between p-3 md:p-4 rounded-lg border ${
                    darkMode 
                      ? 'glass-dark border-white/5' 
                      : 'bg-white/60 border-white/20'
                  }`}>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                        attempt.testType === 'navodaya' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        {attempt.testType === 'navodaya' ? (
                          <BookOpen size={16} className="text-white" />
                        ) : (
                          <Award size={16} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm md:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {attempt.testName}
                        </p>
                        <p className={`text-xs md:text-sm flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Calendar size={12} />
                          <span>{new Date(attempt.date).toLocaleDateString()}</span>
                          <span className="text-xs ml-2">
                            {new Date(attempt.date).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-sm md:text-lg font-bold ${
                          darkMode 
                            ? 'text-purple-400'
                            : 'text-purple-600'
                        }`}>
                          {attempt.percentage}%
                        </p>
                        <p className={`text-xs font-medium ${
                          darkMode 
                            ? 'text-cyan-400'
                            : 'text-purple-600'
                        }`}>
                          {attempt.score}/{attempt.totalMarks}
                        </p>
                      </div>
                      <button
                        onClick={() => viewAttemptDetails(attempt)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        }`}
                        title="View Details"
                      >
                        <Eye size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Test Detail Modal */}
        {showDetailModal && selectedAttempt && (
          <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
            darkMode ? 'bg-black/80' : 'bg-gray-900/80'
          }`}>
            <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${
              darkMode 
                ? 'glass-dark border-white/20' 
                : 'bg-white border-gray-200 shadow-2xl'
            }`}>
              <div className={`sticky top-0 backdrop-blur-lg p-4 md:p-6 border-b ${
                darkMode 
                  ? 'bg-black/80 border-white/10' 
                  : 'bg-white/90 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAttempt.testName}</h2>
                    <p className={`text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Score: {selectedAttempt.percentage}% ({selectedAttempt.score}/{selectedAttempt.totalMarks} marks)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X size={20} className={darkMode ? 'text-white' : 'text-gray-600'} />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {getTestDetails(selectedAttempt).sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-4">
                    <h3 className={`text-base md:text-lg font-bold pb-2 border-b ${
                      darkMode 
                        ? 'text-white border-white/10' 
                        : 'text-gray-900 border-gray-200'
                    }`}>
                      {section.name}
                    </h3>
                    
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className={`rounded-xl p-4 border ${
                        darkMode 
                          ? 'glass-dark border-white/10' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start space-x-3 mb-4">
                          <span className={`text-xs md:text-sm font-bold mt-1 ${
                            darkMode ? 'text-purple-400' : 'text-purple-600'
                          }`}>
                            Q{questionIndex + 1}.
                          </span>
                          <p className={`text-sm md:text-base flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {question.question}
                          </p>
                          <div className={`p-1 rounded-full ${
                            question.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {question.isCorrect ? (
                              <Check size={12} className="text-white" />
                            ) : (
                              <X size={12} className="text-white" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isUserAnswer = option === question.userAnswer;
                            const isCorrectAnswer = option === question.correctAnswer;
                            
                            let bgClass = darkMode ? 'bg-white/5' : 'bg-gray-100';
                            let textClass = darkMode ? 'text-gray-300' : 'text-gray-700';
                            let borderClass = darkMode ? 'border-white/10' : 'border-gray-200';
                            
                            if (isCorrectAnswer) {
                              bgClass = darkMode ? 'bg-green-500/20' : 'bg-green-100';
                              textClass = darkMode ? 'text-green-300' : 'text-green-700';
                              borderClass = darkMode ? 'border-green-500/30' : 'border-green-300';
                            } else if (isUserAnswer && !isCorrectAnswer) {
                              bgClass = darkMode ? 'bg-red-500/20' : 'bg-red-100';
                              textClass = darkMode ? 'text-red-300' : 'text-red-700';
                              borderClass = darkMode ? 'border-red-500/30' : 'border-red-300';
                            }

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${bgClass} ${borderClass} flex items-center space-x-3`}
                              >
                                <span className={`text-xs md:text-sm font-bold ${
                                  darkMode ? 'text-purple-400' : 'text-purple-600'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className={`text-xs md:text-sm ${textClass} flex-1`}>
                                  {option}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {isUserAnswer && (
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      isCorrectAnswer
                                        ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                                        : darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      Your Choice
                                    </span>
                                  )}
                                  {isCorrectAnswer && (
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                                    }`}>
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className={`mt-3 flex items-center justify-between text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span>
                            {question.userAnswer === 'Not answered' ? (
                              <span className={darkMode ? 'text-yellow-400' : 'text-yellow-600'}>Not Answered</span>
                            ) : (
                              <span>Your Answer: <strong>{question.userAnswer}</strong></span>
                            )}
                          </span>
                          <span>
                            {question.isCorrect ? 
                              `Earned: ${question.marks}` : 
                              'Earned: 0'
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;