import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isQuizPage = location.pathname.includes('/quiz/') && !location.pathname.includes('/results/');
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {!isLandingPage && <Header />}
      <main className={`${!isLandingPage ? 'pt-12 sm:pt-14 md:pt-16' : ''} ${!isQuizPage ? 'pb-12 sm:pb-14 md:pb-16' : ''}`}>
        {children}
      </main>
      {!isQuizPage && !isLandingPage && <BottomNav />}
    </div>
  );
};

export default Layout;