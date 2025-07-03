import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';

const Quiz: React.FC = () => {
  const { testType, testId } = useParams<{ testType: string; testId: string }>();
  const navigate = useNavigate();
  const { 
    setCurrentTest, 
    userAnswers, 
    setUserAnswers, 
    addUserAnswer, 
    setCurrentAttemptId,
    language,
    clearUserAnswers
  } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [test, setTest] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get available tests from localStorage or default
  const getAvailableTests = useCallback(async () => {
    try {
      const savedTests = localStorage.getItem('admin-tests');
      if (savedTests) {
        const parsedTests = JSON.parse(savedTests);
        if (Array.isArray(parsedTests) && parsedTests.length > 0) {
          return parsedTests;
        }
      }
    } catch (error) {
      console.error('Error loading saved tests:', error);
    }
    
    // Import default tests as fallback
    try {
      const module = await import('../data/testData');
      return module.availableTests;
    } catch (error) {
      console.error('Error loading default tests:', error);
      return [];
    }
  }, []);

  // Initialize test data
  useEffect(() => {
    const loadTest = async () => {
      setIsLoading(true);
      
      try {
        const availableTests = await getAvailableTests();
        const foundTest = availableTests.find((t: any) => t.id === testId && t.testType === testType);
        
        if (!foundTest) {
          navigate('/quiz-selection');
          return;
        }

        setTest(foundTest);
        
        // Clear previous answers when starting a new test
        clearUserAnswers();
        
        setCurrentTest(foundTest);
        const newAttemptId = `${testId}-${Date.now()}`;
        setAttemptId(newAttemptId);
        setCurrentAttemptId(newAttemptId);

        // Flatten all questions with section information
        const questions = foundTest.sections.flatMap((section: any) => 
          section.questions.map((q: any) => ({ 
            ...q, 
            sectionName: section.name,
            sectionNameHi: section.nameHi 
          }))
        );
        setAllQuestions(questions);

        // Clear any existing saved answers for this session
        localStorage.removeItem(`quiz-answers-${newAttemptId}`);
        
      } catch (error) {
        console.error('Error loading test:', error);
        navigate('/quiz-selection');
      } finally {
        setIsLoading(false);
      }
    };

    if (testId && testType) {
      loadTest();
    }
  }, [testId, testType, getAvailableTests, setCurrentTest, setCurrentAttemptId, navigate, clearUserAnswers]);

  // Update selected answer when question changes
  useEffect(() => {
    if (allQuestions.length > 0 && currentQuestionIndex < allQuestions.length) {
      const currentQuestion = allQuestions[currentQuestionIndex];
      const existingAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
      setSelectedAnswer(existingAnswer?.selectedAnswer || '');
    }
  }, [currentQuestionIndex, userAnswers, allQuestions]);

  // Auto-save answers
  useEffect(() => {
    if (userAnswers.length > 0 && attemptId) {
      localStorage.setItem(`quiz-answers-${attemptId}`, JSON.stringify(userAnswers));
    }
  }, [userAnswers, attemptId]);

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    
    if (allQuestions.length > 0 && currentQuestionIndex < allQuestions.length) {
      const currentQuestion = allQuestions[currentQuestionIndex];
      const userAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect: answer === currentQuestion.correctAnswer,
        marks: answer === currentQuestion.correctAnswer ? currentQuestion.marks : 0
      };
      
      addUserAnswer(userAnswer);
    }
  }, [allQuestions, currentQuestionIndex, addUserAnswer]);

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (confirm(language === 'hi' ? 'क्या आप टेस्ट सबमिट करना चाहते हैं?' : 'Are you sure you want to submit the test?')) {
      // Clean up saved answers
      if (attemptId) {
        localStorage.removeItem(`quiz-answers-${attemptId}`);
      }
      navigate(`/results/${testType}/${testId}`);
    }
  };

  const handleTimeUp = useCallback(() => {
    alert(language === 'hi' ? 'समय समाप्त! टेस्ट सबमिट हो रहा है।' : 'Time is up! Submitting the test.');
    // Clean up saved answers
    if (attemptId) {
      localStorage.removeItem(`quiz-answers-${attemptId}`);
    }
    navigate(`/results/${testType}/${testId}`);
  }, [language, attemptId, navigate, testType, testId]);

  if (isLoading || !test || allQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const answeredQuestions = userAnswers.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'hi' && test.testNameHi ? test.testNameHi : test.testName}
            </h1>
          </div>
          <Timer duration={test.durationInMinutes} onTimeUp={handleTimeUp} />
        </div>
        
        <div className="mt-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
            <span>{answeredQuestions}/{allQuestions.length} answered</span>
          </div>
          <ProgressBar current={currentQuestionIndex + 1} total={allQuestions.length} />
        </div>
      </div>

      {/* Question */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-full mb-4">
              {language === 'hi' && currentQuestion.sectionNameHi 
                ? currentQuestion.sectionNameHi 
                : currentQuestion.sectionName}
            </span>
            <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
              {language === 'hi' && currentQuestion.questionHi 
                ? currentQuestion.questionHi 
                : currentQuestion.question}
            </p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => {
              const optionText = language === 'hi' && currentQuestion.optionsHi 
                ? currentQuestion.optionsHi[index] 
                : option;
              
              const isSelected = selectedAnswer === option;
              
              return (
                <button
                  key={`${currentQuestion.id}-${index}`}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md transform scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1">{optionText}</span>
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
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>{language === 'hi' ? 'पिछला' : 'Previous'}</span>
          </button>

          <div className="flex space-x-3">
            {currentQuestionIndex === allQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                <Flag size={20} />
                <span>{language === 'hi' ? 'सबमिट करें' : 'Submit Test'}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
              >
                <span>{language === 'hi' ? 'अगला' : 'Next'}</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;