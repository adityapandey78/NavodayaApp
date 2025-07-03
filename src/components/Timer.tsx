import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return 'text-green-600 dark:text-green-400';
    if (percentage > 25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
      <Clock size={20} className={getTimerColor()} />
      <span className={`font-mono text-lg font-semibold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;