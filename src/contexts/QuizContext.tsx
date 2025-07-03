import React, { createContext, useContext, useState, useEffect } from 'react';
import { TestData, TestAttempt, UserAnswer } from '../types/quiz';
import { useAuth } from './AuthContext';
import { attemptService } from '../lib/supabase';

interface QuizContextType {
  currentTest: TestData | null;
  setCurrentTest: (test: TestData | null) => void;
  userAnswers: UserAnswer[];
  setUserAnswers: (answers: UserAnswer[]) => void;
  addUserAnswer: (answer: UserAnswer) => void;
  testAttempts: TestAttempt[];
  addTestAttempt: (attempt: TestAttempt) => void;
  currentAttemptId: string | null;
  setCurrentAttemptId: (id: string | null) => void;
  clearUserAnswers: () => void;
  loadUserAttempts: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user attempts from Supabase or localStorage
  const loadUserAttempts = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (user) {
        try {
          const supabaseAttempts = await attemptService.getUserAttempts(user.id);
          const formattedAttempts = supabaseAttempts.map(attempt => ({
            id: attempt.id,
            testId: attempt.test_id,
            testType: attempt.test_type as 'navodaya' | 'sainik',
            testName: attempt.test_name,
            score: attempt.score,
            totalMarks: attempt.total_marks,
            percentage: attempt.percentage,
            date: attempt.completed_at,
            duration: attempt.duration,
            sectionWiseScore: attempt.section_wise_score
          }));
          setTestAttempts(formattedAttempts);
        } catch (error) {
          console.error('Error loading user attempts from Supabase:', error);
          loadLocalAttempts();
        }
      } else {
        loadLocalAttempts();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalAttempts = () => {
    const savedAttempts = localStorage.getItem('prep-with-satyam-attempts');
    if (savedAttempts) {
      try {
        const parsedAttempts = JSON.parse(savedAttempts);
        if (Array.isArray(parsedAttempts)) {
          setTestAttempts(parsedAttempts);
        }
      } catch (error) {
        console.error('Error parsing saved attempts:', error);
        localStorage.removeItem('prep-with-satyam-attempts');
      }
    }
  };

  // Load attempts only once when user changes
  useEffect(() => {
    loadUserAttempts();
  }, [user?.id]);

  // Save attempts to localStorage for guest users (debounced)
  useEffect(() => {
    if (testAttempts.length > 0 && !user) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('prep-with-satyam-attempts', JSON.stringify(testAttempts));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [testAttempts, user]);

  const addUserAnswer = (answer: UserAnswer) => {
    setUserAnswers(prev => {
      const existing = prev.find(a => a.questionId === answer.questionId);
      if (existing) {
        return prev.map(a => a.questionId === answer.questionId ? answer : a);
      }
      return [...prev, answer];
    });
  };

  const addTestAttempt = async (attempt: TestAttempt) => {
    if (user) {
      try {
        const savedAttempt = await attemptService.saveAttempt({
          testId: attempt.testId,
          testType: attempt.testType,
          testName: attempt.testName,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          percentage: attempt.percentage,
          duration: attempt.duration,
          sectionWiseScore: attempt.sectionWiseScore,
          userAnswers: userAnswers
        }, user.id);

        if (savedAttempt) {
          const formattedAttempt = {
            id: savedAttempt.id,
            testId: savedAttempt.test_id,
            testType: savedAttempt.test_type as 'navodaya' | 'sainik',
            testName: savedAttempt.test_name,
            score: savedAttempt.score,
            totalMarks: savedAttempt.total_marks,
            percentage: savedAttempt.percentage,
            date: savedAttempt.completed_at,
            duration: savedAttempt.duration,
            sectionWiseScore: savedAttempt.section_wise_score
          };

          setTestAttempts(prev => {
            const existingIndex = prev.findIndex(a => a.id === formattedAttempt.id);
            if (existingIndex >= 0) {
              const newAttempts = [...prev];
              newAttempts[existingIndex] = formattedAttempt;
              return newAttempts;
            } else {
              return [...prev, formattedAttempt];
            }
          });
        }
      } catch (error) {
        console.error('Error saving attempt to Supabase:', error);
        addLocalAttempt(attempt);
      }
    } else {
      addLocalAttempt(attempt);
    }
  };

  const addLocalAttempt = (attempt: TestAttempt) => {
    setTestAttempts(prev => {
      const existingIndex = prev.findIndex(a => a.id === attempt.id);
      if (existingIndex >= 0) {
        const newAttempts = [...prev];
        newAttempts[existingIndex] = attempt;
        return newAttempts;
      } else {
        return [...prev, attempt];
      }
    });
  };

  const clearUserAnswers = () => {
    setUserAnswers([]);
  };

  return (
    <QuizContext.Provider value={{
      currentTest,
      setCurrentTest,
      userAnswers,
      setUserAnswers,
      addUserAnswer,
      testAttempts,
      addTestAttempt,
      currentAttemptId,
      setCurrentAttemptId,
      clearUserAnswers,
      loadUserAttempts
    }}>
      {children}
    </QuizContext.Provider>
  );
};