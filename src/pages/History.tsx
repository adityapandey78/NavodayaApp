import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Award, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuiz } from '../contexts/QuizContext';

const History: React.FC = () => {
  const { testAttempts, language } = useQuiz();
  const navigate = useNavigate();

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

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'hi' ? 'परीक्षा इतिहास' : 'Test History'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'अपने प्रदर्शन को ट्रैक करें' 
            : 'Track your performance over time'}
        </p>
      </div>

      {testAttempts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'hi' ? 'कोई परीक्षा नहीं ली गई' : 'No Tests Taken Yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {language === 'hi' 
              ? 'अपनी पहली परीक्षा लेकर शुरुआत करें' 
              : 'Start by taking your first test'}
          </p>
          <button
            onClick={() => navigate('/quiz-selection')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {language === 'hi' ? 'परीक्षा शुरू करें' : 'Start Test'}
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'hi' ? 'कुल परीक्षाएं' : 'Total Tests'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {testAttempts.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'hi' ? 'औसत स्कोर' : 'Average Score'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {averageScore}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Award size={20} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'hi' ? 'सर्वश्रेष्ठ स्कोर' : 'Best Score'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bestScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'hi' ? 'प्रदर्शन चार्ट' : 'Performance Chart'}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="attempt" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Test Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'hi' ? 'नवोदय विद्यालय' : 'Navodaya Tests'}
              </h3>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {navodayaAttempts.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'hi' ? 'परीक्षाएं पूरी की गईं' : 'Tests Completed'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'hi' ? 'सैनिक स्कूल' : 'Sainik School Tests'}
              </h3>
              <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {sainikAttempts.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'hi' ? 'परीक्षाएं पूरी की गईं' : 'Tests Completed'}
              </p>
            </div>
          </div>

          {/* Recent Attempts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'hi' ? 'हाल की परीक्षाएं' : 'Recent Tests'}
            </h2>
            <div className="space-y-3">
              {testAttempts.slice(-5).reverse().map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      attempt.testType === 'navodaya' 
                        ? 'bg-primary-100 dark:bg-primary-900/20' 
                        : 'bg-accent-100 dark:bg-accent-900/20'
                    }`}>
                      {attempt.testType === 'navodaya' ? (
                        <BookOpen size={20} className="text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Award size={20} className="text-accent-600 dark:text-accent-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {attempt.testName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{new Date(attempt.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {attempt.percentage}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {attempt.score}/{attempt.totalMarks}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default History;