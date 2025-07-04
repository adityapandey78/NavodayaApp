import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update the ref when onTimeUp changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return 'text-green-300';
    if (percentage > 25) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className="flex items-center space-x-2 glass-dark rounded-xl px-3 py-2 md:px-4 md:py-2 border border-white/20">
      <Clock size={16} className={getTimerColor()} />
      <span className={`font-mono text-sm md:text-lg font-bold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;