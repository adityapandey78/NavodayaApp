import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Ensure duration is a valid number
    const validDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 60;
    return validDuration * 60;
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update the ref when onTimeUp changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Validate duration
    if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
      console.error('Invalid timer duration:', duration);
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset time left when duration changes
    setTimeLeft(duration * 60);

    // Start the timer
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration]); // Only depend on duration

  const formatTime = (seconds: number) => {
    // Handle invalid numbers
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return 'text-green-300';
    if (percentage > 25) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className="flex items-center space-x-1.5 sm:space-x-2 glass-dark rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 md:px-4 md:py-2 border border-white/20">
      <Clock size={14} className={`${getTimerColor()} sm:w-4 sm:h-4`} />
      <span className={`font-mono text-xs sm:text-xs md:text-base font-bold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;