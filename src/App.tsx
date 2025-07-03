import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import QuizSelection from './pages/QuizSelection';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import History from './pages/History';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <QuizProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/quiz-selection" element={<QuizSelection />} />
                  <Route path="/quiz/:testType/:testId" element={<Quiz />} />
                  <Route path="/results/:testType/:testId" element={<Results />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </Router>
          </QuizProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;