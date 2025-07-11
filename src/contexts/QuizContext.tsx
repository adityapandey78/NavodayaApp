import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TestData, TestAttempt, UserAnswer } from '../types/quiz';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { attemptService, networkService } from '../lib/supabase';

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
  syncPendingAttempts: () => Promise<void>;
  hasPendingAttempts: boolean;
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
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingAttempts, setHasPendingAttempts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for pending attempts
  useEffect(() => {
    const pending = attemptService.getPendingAttempts();
    setHasPendingAttempts(pending.length > 0);
  }, []);

  // Load user attempts from Supabase
  const loadUserAttempts = useCallback(async () => {
    if (isLoading || !user) return;
    
    setIsLoading(true);
    try {
      const supabaseAttempts = await attemptService.getUserAttempts(user.id);
      // Sort attempts by date (most recent first)
      const sortedAttempts = supabaseAttempts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTestAttempts(sortedAttempts);
      // Removed success message to prevent continuous popups
      console.log(`Loaded ${sortedAttempts.length} test attempts for user`);
    } catch (error: any) {
      console.error('Error loading user attempts:', error);
      if (error.message.includes('internet') || error.message.includes('connection')) {
        showWarning('Cannot load test history - please check your internet connection');
      } else {
        showError('Failed to load test history');
      }
      setTestAttempts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, showWarning, showError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync pending attempts when back online
  const syncPendingAttempts = useCallback(async () => {
    try {
      await attemptService.syncPendingAttempts();
      setHasPendingAttempts(false);
      showSuccess('Pending test results uploaded successfully!');
      
      // Reload attempts after sync
      if (user) {
        await loadUserAttempts();
      }
    } catch (error: any) {
      console.error('Error syncing pending attempts:', error);
      if (error.message.includes('internet') || error.message.includes('connection')) {
        showError('Cannot upload results - please check your internet connection');
      } else {
        showError('Failed to upload pending results');
      }
    }
  }, [showSuccess, showError, user, loadUserAttempts]);

  // Load attempts when user changes
  useEffect(() => {
    if (user) {
      loadUserAttempts();
    } else {
      setTestAttempts([]);
    }
  }, [user, loadUserAttempts]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      showInfo('Back online! Syncing data...');
      if (hasPendingAttempts) {
        syncPendingAttempts();
      }
    };

    const handleOffline = () => {
      showWarning('You are now offline. Quiz answers will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasPendingAttempts, syncPendingAttempts]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Prevent multiple submissions with stronger checks
    if (isSubmitting) {
      console.log('Already submitting, skipping duplicate submission');
      return;
    }
    
    // Check if attempt already exists (by ID or recent attempt with same test)
    const existingAttempt = testAttempts.find(existing => 
      existing.id === attempt.id || 
      (existing.testId === attempt.testId && 
       Math.abs(new Date(existing.date).getTime() - new Date(attempt.date).getTime()) < 10000) // Within 10 seconds
    );
    
    if (existingAttempt) {
      console.log('Duplicate attempt detected, skipping submission');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (user) {
        try {
          // Check if online - REQUIRED for submission
          if (!networkService.isOnline()) {
            throw new Error('Internet connection required');
          }
          
          // Always try to save online for test submissions
          const savedAttempt = await attemptService.saveAttempt({
            testId: attempt.testId,
            testType: attempt.testType,
            testName: attempt.testName,
            score: attempt.score,
            totalMarks: attempt.totalMarks,
            percentage: attempt.percentage,
            duration: attempt.duration,
            sectionWiseScore: attempt.sectionWiseScore,
            userAnswers: userAnswers.map(answer => ({
              questionId: answer.questionId,
              selectedAnswer: answer.selectedAnswer,
              isCorrect: answer.isCorrect,
              marks: answer.marks
            }))
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

            // Add to beginning and sort by date
            setTestAttempts(prev => {
              // Strong duplicate check before adding
              const isDuplicate = prev.some(existing => 
                existing.id === formattedAttempt.id ||
                (existing.testId === formattedAttempt.testId && 
                 existing.testType === formattedAttempt.testType &&
                 Math.abs(new Date(existing.date).getTime() - new Date(formattedAttempt.date).getTime()) < 10000)
              );
              
              if (isDuplicate) {
                console.log('Duplicate attempt detected in state update, skipping');
                return prev;
              }
              
              const filtered = prev.filter(existing => existing.id !== formattedAttempt.id);
              const updated = [formattedAttempt, ...filtered];
              return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });
            showSuccess('Test results submitted successfully!');
          } else {
            // savedAttempt is null, meaning it was a duplicate caught at database level
            console.log('Duplicate attempt caught at database level');
            showSuccess('Test already submitted - no duplicate created!');
          }
        } catch (error: any) {
          console.error('Error saving attempt:', error);
          
          if (error.message.includes('internet') || error.message.includes('connection') || !networkService.isOnline()) {
            // Save to pending only as a backup, but show error for submission failure
            attemptService.savePendingAttempt({
              testId: attempt.testId,
              testType: attempt.testType,
              testName: attempt.testName,
              score: attempt.score,
              totalMarks: attempt.totalMarks,
              percentage: attempt.percentage,
              duration: attempt.duration,
              sectionWiseScore: attempt.sectionWiseScore,
              userAnswers: userAnswers.map(answer => ({
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: answer.isCorrect,
                marks: answer.marks
              }))
            }, user.id);
            
            setHasPendingAttempts(true);
            showError('❌ Submission Failed\n\nInternet connection required to submit test results.\n\nResults saved locally and will be uploaded when you reconnect.');
          } else {
            showError(`❌ Submission Failed\n\n${error.message}\n\nPlease try again with a stable internet connection.`);
          }
          
          // Add to local state for immediate display even if submission failed
          setTestAttempts(prev => {
            // Strong duplicate check before adding
            const isDuplicate = prev.some(existing => 
              existing.id === attempt.id ||
              (existing.testId === attempt.testId && 
               existing.testType === attempt.testType &&
               Math.abs(new Date(existing.date).getTime() - new Date(attempt.date).getTime()) < 10000)
            );
            
            if (isDuplicate) {
              console.log('Duplicate attempt detected in error fallback, skipping');
              return prev;
            }
            
            const filtered = prev.filter(existing => existing.id !== attempt.id);
            const updated = [attempt, ...filtered];
            return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          });
        }
      } else {
        // Guest user - save locally only
        setTestAttempts(prev => {
          // Strong duplicate check before adding
          const isDuplicate = prev.some(existing => 
            existing.id === attempt.id ||
            (existing.testId === attempt.testId && 
             existing.testType === attempt.testType &&
             Math.abs(new Date(existing.date).getTime() - new Date(attempt.date).getTime()) < 10000)
          );
          
          if (isDuplicate) {
            console.log('Duplicate attempt detected in guest mode, skipping');
            return prev;
          }
          
          const filtered = prev.filter(existing => existing.id !== attempt.id);
          const updated = [attempt, ...filtered];
          return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        showWarning('📱 Guest Mode\n\nResults saved locally only.\n\nSign in to submit results online and sync across devices.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearUserAnswers = () => {
    setUserAnswers([]);
    setIsSubmitting(false);
    setCurrentAttemptId(null);
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
      loadUserAttempts,
      syncPendingAttempts,
      hasPendingAttempts
    }}>
      {children}
    </QuizContext.Provider>
  );
};