export interface Question {
  id: string;
  question: string;
  questionHi?: string;
  options: string[];
  optionsHi?: string[];
  correctAnswer: string;
  marks: number;
}

export interface Section {
  name: string;
  nameHi?: string;
  questions: Question[];
}

export interface TestData {
  id: string;
  testType: 'navodaya' | 'sainik';
  testName: string;
  testNameHi?: string;
  totalMarks: number;
  testDate: string;
  durationInMinutes: number;
  sections: Section[];
  isLive: boolean;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  marks: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testType: 'navodaya' | 'sainik';
  testName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  date: string;
  duration: number;
  sectionWiseScore: { [sectionName: string]: { score: number; total: number } };
}