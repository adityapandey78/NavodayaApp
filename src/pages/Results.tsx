import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Target, Clock, Home, RotateCcw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import { useToast } from '../contexts/ToastContext';
import { networkService } from '../lib/supabase';

const Results: React.FC = () => {
  const { testType, testId } = useParams<{ testType: string; testId: string }>();
  const navigate = useNavigate();
  const { userAnswers, addTestAttempt, currentAttemptId } = useQuiz();
  const { showWarning, showInfo } = useToast();
  const [results, setResults] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [attemptSaved, setAttemptSaved] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const loadTestAndCalculateResults = async () => {
      try {
        // Get test data from cache first
        let foundTest = null;
        
        try {
          const cachedTests = JSON.parse(localStorage.getItem('cached_tests') || '[]');
          foundTest = cachedTests.find((t: any) => t.id === testId && t.testType === testType);
        } catch (error) {
          console.error('Error loading cached tests:', error);
        }
        
        // Fallback to default tests if not in cache
        if (!foundTest) {
          try {
            const module = await import('../data/testData');
            const defaultTests = module.availableTests || [];
            foundTest = defaultTests.find((t: any) => t.id === testId && t.testType === testType);
          } catch (error) {
            console.error('Error loading default tests:', error);
            navigate('/quiz-selection');
            return;
          }
        }

        if (!foundTest) {
          navigate('/quiz-selection');
          return;
        }

        setTest(foundTest);

        // Calculate results
        const allQuestions = foundTest.sections.flatMap((section: any) => 
          section.questions.map((q: any) => ({ ...q, sectionName: section.name }))
        );

        const totalScore = userAnswers.reduce((sum, answer) => sum + answer.marks, 0);
        const totalMarks = foundTest.totalMarks;
        const percentage = Math.round((totalScore / totalMarks) * 100);

        // Section-wise analysis
        const sectionWiseScore: { [key: string]: { score: number; total: number } } = {};
        
        foundTest.sections.forEach((section: any) => {
          const sectionQuestions = section.questions;
          const sectionTotal = sectionQuestions.reduce((sum: number, q: any) => sum + q.marks, 0);
          const sectionScore = sectionQuestions.reduce((sum: number, q: any) => {
            const userAnswer = userAnswers.find(a => a.questionId === q.id);
            return sum + (userAnswer?.marks || 0);
          }, 0);
          
          sectionWiseScore[section.name] = { score: sectionScore, total: sectionTotal };
        });

        const correct = userAnswers.filter(a => a.isCorrect).length;
        const incorrect = userAnswers.filter(a => !a.isCorrect).length;
        const unanswered = allQuestions.length - userAnswers.length;

        const resultData = {
          totalScore,
          totalMarks,
          percentage,
          correct,
          incorrect,
          unanswered,
          sectionWiseScore
        };

        setResults(resultData);

        // Save to history only once
        if (!attemptSaved && currentAttemptId) {
          const attempt = {
            id: currentAttemptId,
            testId: testId!,
            testType: testType as 'navodaya' | 'sainik',
            testName: foundTest.testName,
            score: totalScore,
            totalMarks,
            percentage,
            date: new Date().toISOString(),
            duration: foundTest.durationInMinutes,
            sectionWiseScore
          };

          await addTestAttempt(attempt);
          setAttemptSaved(true);
          
          if (!isOnline) {
            showWarning('Results saved locally. Will upload when internet is available.');
          } else {
            showInfo('Results saved successfully!');
          }
        }
      } catch (error) {
        console.error('Error calculating results:', error);
        navigate('/quiz-selection');
      }
    };

    loadTestAndCalculateResults();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [testId, testType, userAnswers, navigate, addTestAttempt, currentAttemptId, attemptSaved, isOnline]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excellent Performance! 🎉';
    if (percentage >= 60) return 'Good Job! 👍';
    if (percentage >= 40) return 'Keep Improving! 💪';
    return 'Need More Practice! 📚';
  };

  if (!results || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Calculating results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <WifiOff size={24} className="text-yellow-300" />
              <div>
                <p className="font-bold text-yellow-200">Offline Mode</p>
                <p className="text-yellow-300 text-sm">Results saved locally. Will upload when internet is available.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Trophy size={48} className="text-white" />
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h1 className="text-3xl font-bold text-white">Test Results</h1>
            {isOnline ? (
              <Wifi size={20} className="text-green-300" />
            ) : (
              <WifiOff size={20} className="text-red-300" />
            )}
          </div>
          <p className="text-white/80 text-lg">{test?.testName}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className={`text-7xl font-bold mb-4 ${getScoreColor(results.percentage)}`}>
              {results.percentage}%
            </div>
            <p className="text-2xl font-bold text-white mb-4">
              {getPerformanceMessage(results.percentage)}
            </p>
            <p className="text-white/80 text-lg">
              {results.totalScore} / {results.totalMarks} marks
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
              <div className="text-3xl font-bold text-white">
                {results.correct}
              </div>
              <p className="text-white/90 font-medium">Correct</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl">
              <div className="text-3xl font-bold text-white">
                {results.incorrect}
              </div>
              <p className="text-white/90 font-medium">Incorrect</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl">
              <div className="text-3xl font-bold text-white">
                {results.unanswered}
              </div>
              <p className="text-white/90 font-medium">Unanswered</p>
            </div>
          </div>
        </div>

        {/* Section-wise Performance */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">Section-wise Performance</h2>
          <div className="space-y-4">
            {Object.entries(results.sectionWiseScore).map(([sectionName, scores]: [string, any]) => {
              const percentage = Math.round((scores.score / scores.total) * 100);
              return (
                <div key={sectionName} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <div>
                    <p className="font-bold text-white">{sectionName}</p>
                    <p className="text-white/80 text-sm">
                      {scores.score}/{scores.total} marks
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getScoreColor(percentage)}`}>
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Home size={24} />
            <span className="text-lg">Go Home</span>
          </button>
          <button
            onClick={() => navigate('/quiz-selection')}
            className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RotateCcw size={24} />
            <span className="text-lg">Take Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;