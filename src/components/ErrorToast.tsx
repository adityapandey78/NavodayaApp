import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <AlertCircle size={20} className="text-red-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-200';
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-200';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-200';
      default:
        return 'bg-red-500/20 border-red-500/30 text-red-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg border backdrop-blur-lg ${getColors()} animate-slide-in`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;