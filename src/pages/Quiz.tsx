import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Globe } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { testService } from '../lib/supabase';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';

const Quiz: React.FC = () => {
  const { testType, testId } = useParams<{ testType: string; testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const { 
    setCurrentTest, 
    userAnswers, 
    addUserAnswer, 
    setCurrentAttemptId,
    clearUserAnswers
  } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [test, setTest] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showHindi, setShowHindi] = useState(false);

  // Memoize the current question to prevent unnecessary re-renders
  const currentQuestion = useMemo(() => {
    return allQuestions.length > 0 && currentQuestionIndex < allQuestions.length 
      ? allQuestions[currentQuestionIndex] 
      : null;
  }, [allQuestions, currentQuestionIndex]);

  // Load test data - memoized to prevent infinite calls
  const loadTest = useCallback(async () => {
    if (!testId || !testType || isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let foundTest = null;

      // Try to get test by ID (includes all fallbacks)
      try {
        foundTest = await testService.getTestById(testId);
      } catch (testError) {
        console.error('Error loading test:', testError);
      }

      if (!foundTest) {
        setError('Test not found. Please go back and select a valid test.');
        return;
      }

      // Ensure the test has the correct structure
      if (!foundTest.sections || !Array.isArray(foundTest.sections)) {
        setError('Invalid test format. Please contact administrator.');
        return;
      }

      // Set test data
      setTest(foundTest);
      setCurrentTest(foundTest);

      // Clear previous answers and setup new attempt
      clearUserAnswers();
      const newAttemptId = `${testId}-${Date.now()}`;
      setAttemptId(newAttemptId);
      setCurrentAttemptId(newAttemptId);

      // Flatten questions
      const questions = foundTest.sections.flatMap((section: any) => 
        section.questions.map((q: any) => ({ 
          ...q, 
          sectionName: section.name,
          sectionNameHi: section.nameHi || section.name
        }))
      );
      
      if (questions.length === 0) {
        setError('This test has no questions. Please contact administrator.');
        return;
      }
      
      setAllQuestions(questions);
      setIsInitialized(true);
      
    } catch (error) {
      console.error('Error loading test:', error);
      setError('Failed to load test. Please try again or go back to test selection.');
    } finally {
      setIsLoading(false);
    }
  }, [testId, testType, isInitialized, setCurrentTest, setCurrentAttemptId, clearUserAnswers]);

  // Initialize test on mount - only once
  useEffect(() => {
    if (!isInitialized) {
      loadTest();
    }
  }, [loadTest, isInitialized]);

  // Update selected answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
      setSelectedAnswer(existingAnswer?.selectedAnswer || '');
    }
  }, [currentQuestion, userAnswers]);

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    
    if (currentQuestion) {
      const userAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect: answer === currentQuestion.correctAnswer,
        marks: answer === currentQuestion.correctAnswer ? currentQuestion.marks : 0
      };
      
      addUserAnswer(userAnswer);
    }
  }, [currentQuestion, addUserAnswer]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, allQuestions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    // Check if online before allowing submission
    if (!navigator.onLine) {
      showError('🌐 Internet Connection Required\n\nYou must be connected to the internet to submit your test. Please:\n\n1. Check your internet connection\n2. Try again once connected\n\nYour answers are saved and will not be lost.');
      return;
    }
    
    // Immediate navigation to prevent freezing
    navigate(`/results/${testType}/${testId}`);
  }, [navigate, testType, testId, showError]);

  const handleTimeUp = useCallback(() => {
    if (!navigator.onLine) {
      showError('⏰ Time is Up!\n\nInternet connection is required to submit your test.\n\nPlease:\n1. Connect to the internet\n2. Click the Submit button manually\n\nYour answers are saved and will not be lost.');
      return;
    }
    
    // Immediate navigation to prevent freezing
    navigate(`/results/${testType}/${testId}`);
  }, [navigate, testType, testId, showError]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm md:text-lg font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test || allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center glass-dark rounded-2xl p-6 md:p-8 border border-white/20">
          <p className="text-white text-sm md:text-lg font-medium mb-4">
            {error || 'Test not found or has no questions'}
          </p>
          <button
            onClick={() => navigate('/quiz-selection')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-sm md:text-lg font-medium">Loading question...</p>
        </div>
      </div>
    );
  }

  const answeredQuestions = userAnswers.length;
  const hasHindiContent = currentQuestion.questionHi && currentQuestion.questionHi !== currentQuestion.question;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="glass-dark border-b border-white/10 p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between max-w-7xl mx-auto space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <h1 className="text-sm sm:text-base md:text-xl font-bold text-white">
              {test.testName}
            </h1>
            {hasHindiContent && (
              <button
                onClick={() => setShowHindi(!showHindi)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-xs md:text-sm font-medium transition-colors self-start ${
                  showHindi 
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                    : 'bg-white/10 text-white/80 border border-white/20'
                }`}
              >
                <Globe size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>{showHindi ? 'हिंदी' : 'Hindi'}</span>
              </button>
            )}
          </div>
          <Timer duration={test.durationInMinutes && test.durationInMinutes > 0 ? test.durationInMinutes : 60} onTimeUp={handleTimeUp} />
        </div>
        
        <div className="mt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-xs sm:text-xs md:text-sm text-white/80 mb-2">
            <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
            <span>{answeredQuestions}/{allQuestions.length} answered</span>
          </div>
          <ProgressBar current={currentQuestionIndex + 1} total={allQuestions.length} />
        </div>
      </div>

      {/* Question */}
      <div className="p-3 sm:p-4 max-w-4xl mx-auto">
        <div className="glass-dark rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/10 mb-4 sm:mb-6">
          <div className="mb-4">
            <span className="inline-block px-2 sm:px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-xs sm:text-xs md:text-sm rounded-full mb-3 sm:mb-4 font-medium border border-purple-500/30">
              {currentQuestion.sectionName}
            </span>
            <div className="quiz-question text-sm sm:text-base md:text-lg font-medium text-white leading-relaxed">
                {showHindi && currentQuestion.questionHi 
                  ? currentQuestion.questionHi 
                  : currentQuestion.question}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-2 md:space-y-3">
            {currentQuestion.options.map((option: string, index: number) => {
              const optionText = showHindi && currentQuestion.optionsHi 
                ? currentQuestion.optionsHi[index] 
                : option;
              
              const isSelected = selectedAnswer === option;
              
              return (
                <button
                  key={`${currentQuestion.id}-${index}`}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-white shadow-lg transform scale-[1.02]'
                      : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-white/40'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-bold text-cyan-300 text-xs sm:text-sm md:text-base mt-0.5">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="quiz-option flex-1 text-sm sm:text-base md:text-lg leading-relaxed">{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 border border-white/20 text-sm sm:text-sm md:text-base"
          >
            <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
            <span className="font-medium">Previous</span>
          </button>

          <div className="flex space-x-4">
            {currentQuestionIndex === allQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-sm md:text-base"
              >
                <Flag size={14} className="sm:w-4 sm:h-4" />
                <span>Submit Test</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-sm md:text-base"
              >
                <span className="font-medium">Next</span>
                <ChevronRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;