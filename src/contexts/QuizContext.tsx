import React, { createContext, useContext, useState, useEffect } from 'react';
import { TestData, TestAttempt, UserAnswer } from '../types/quiz';

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
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  clearUserAnswers: () => void;
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
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    const savedAttempts = localStorage.getItem('prep-with-satyam-attempts');
    if (savedAttempts) {
      try {
        const parsedAttempts = JSON.parse(savedAttempts);
        // Ensure we have valid data structure
        if (Array.isArray(parsedAttempts)) {
          setTestAttempts(parsedAttempts);
        }
      } catch (error) {
        console.error('Error parsing saved attempts:', error);
        localStorage.removeItem('prep-with-satyam-attempts');
      }
    }

    const savedLanguage = localStorage.getItem('prep-with-satyam-language');
    if (savedLanguage) {
      setLanguage(savedLanguage as 'en' | 'hi');
    }
  }, []);

  useEffect(() => {
    if (testAttempts.length > 0) {
      localStorage.setItem('prep-with-satyam-attempts', JSON.stringify(testAttempts));
    }
  }, [testAttempts]);

  useEffect(() => {
    localStorage.setItem('prep-with-satyam-language', language);
  }, [language]);

  const addUserAnswer = (answer: UserAnswer) => {
    setUserAnswers(prev => {
      const existing = prev.find(a => a.questionId === answer.questionId);
      if (existing) {
        return prev.map(a => a.questionId === answer.questionId ? answer : a);
      }
      return [...prev, answer];
    });
  };

  const addTestAttempt = (attempt: TestAttempt) => {
    // Check if this attempt already exists to prevent duplicates
    setTestAttempts(prev => {
      const existingIndex = prev.findIndex(a => a.id === attempt.id);
      if (existingIndex >= 0) {
        // Update existing attempt
        const newAttempts = [...prev];
        newAttempts[existingIndex] = attempt;
        return newAttempts;
      } else {
        // Add new attempt
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
      language,
      setLanguage,
      clearUserAnswers
    }}>
      {children}
    </QuizContext.Provider>
  );
};