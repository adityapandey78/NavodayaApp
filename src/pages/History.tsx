import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Award, BookOpen, Eye, X, Check, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuiz } from '../contexts/QuizContext';

const History: React.FC = () => {
  const { testAttempts } = useQuiz();
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

  // Mock function to get test questions and user answers
  const getTestDetails = (attempt: any) => {
    // This would normally fetch from your database
    // For now, returning mock data
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
              userAnswer: "32",
              isCorrect: true,
              marks: 2
            },
            {
              id: "q2",
              question: "If BOOK is coded as CPPL, then HELP is coded as:",
              options: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
              correctAnswer: "IFMQ",
              userAnswer: "GFKO",
              isCorrect: false,
              marks: 0
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white">Test History</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Track your performance over time
          </p>
        </div>

        {testAttempts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 md:w-24 md:h-24 glass-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">
              No Tests Taken Yet
            </h3>
            <p className="text-gray-400 mb-4 text-sm md:text-base">
              Start by taking your first test
            </p>
            <button
              onClick={() => navigate('/quiz-selection')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
            >
              Start Test
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-dark rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Total Tests</p>
                    <p className="text-lg md:text-2xl font-bold text-white">
                      {testAttempts.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Average Score</p>
                    <p className="text-lg md:text-2xl font-bold text-white">
                      {averageScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Award size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Best Score</p>
                    <p className="text-lg md:text-2xl font-bold text-white">
                      {bestScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {chartData.length > 0 && (
              <div className="glass-dark rounded-xl p-4 md:p-6 border border-white/10">
                <h2 className="text-base md:text-lg font-semibold text-white mb-4">
                  Performance Chart
                </h2>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="attempt" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Test Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-dark rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2 text-sm md:text-base">
                  Navodaya Tests
                </h3>
                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {navodayaAttempts.length}
                </p>
                <p className="text-xs md:text-sm text-gray-400">
                  Tests Completed
                </p>
              </div>

              <div className="glass-dark rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2 text-sm md:text-base">
                  Sainik School Tests
                </h3>
                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {sainikAttempts.length}
                </p>
                <p className="text-xs md:text-sm text-gray-400">
                  Tests Completed
                </p>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="glass-dark rounded-xl p-4 md:p-6 border border-white/10">
              <h2 className="text-base md:text-lg font-semibold text-white mb-4">
                Recent Tests
              </h2>
              <div className="space-y-3">
                {testAttempts.slice(-5).reverse().map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 md:p-4 glass-dark rounded-lg border border-white/5">
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
                        <p className="font-medium text-white text-sm md:text-base truncate">
                          {attempt.testName}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400 flex items-center space-x-2">
                          <Calendar size={12} />
                          <span>{new Date(attempt.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm md:text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {attempt.percentage}%
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">
                          {attempt.score}/{attempt.totalMarks}
                        </p>
                      </div>
                      <button
                        onClick={() => viewAttemptDetails(attempt)}
                        className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-colors"
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="glass-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="sticky top-0 bg-black/80 backdrop-blur-lg p-4 md:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white">{selectedAttempt.testName}</h2>
                    <p className="text-gray-400 text-sm md:text-base">
                      Score: {selectedAttempt.percentage}% ({selectedAttempt.score}/{selectedAttempt.totalMarks})
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {getTestDetails(selectedAttempt).sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-4">
                    <h3 className="text-base md:text-lg font-bold text-white border-b border-white/10 pb-2">
                      {section.name}
                    </h3>
                    
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="glass-dark rounded-xl p-4 border border-white/10">
                        <div className="flex items-start space-x-3 mb-4">
                          <span className="text-xs md:text-sm font-bold text-purple-400 mt-1">
                            Q{questionIndex + 1}.
                          </span>
                          <p className="text-sm md:text-base text-white flex-1">
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
                            
                            let bgClass = 'bg-white/5';
                            let textClass = 'text-gray-300';
                            let borderClass = 'border-white/10';
                            
                            if (isCorrectAnswer) {
                              bgClass = 'bg-green-500/20';
                              textClass = 'text-green-300';
                              borderClass = 'border-green-500/30';
                            } else if (isUserAnswer && !isCorrectAnswer) {
                              bgClass = 'bg-red-500/20';
                              textClass = 'text-red-300';
                              borderClass = 'border-red-500/30';
                            }

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${bgClass} ${borderClass} flex items-center space-x-3`}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-400">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className={`text-xs md:text-sm ${textClass} flex-1`}>
                                  {option}
                                </span>
                                {isUserAnswer && (
                                  <span className="text-xs text-blue-400 font-medium">Your Answer</span>
                                )}
                                {isCorrectAnswer && (
                                  <span className="text-xs text-green-400 font-medium">Correct</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                          <span>Marks: {question.marks}</span>
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