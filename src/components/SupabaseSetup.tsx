import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface SupabaseSetupProps {
  onClose: () => void;
}

const SupabaseSetup: React.FC<SupabaseSetupProps> = ({ onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  const handleConnect = async () => {
    if (!supabaseUrl || !supabaseKey) {
      showError('Please fill in both Supabase URL and Anon Key');
      return;
    }

    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      showError('Please enter a valid Supabase URL (https://your-project.supabase.co)');
      return;
    }

    setIsConnecting(true);

    try {
      // Test the connection by creating a temporary client
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(supabaseUrl, supabaseKey);
      
      // Try a simple query to test the connection
      const { error } = await testClient.from('tests').select('count', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is ok
        throw error;
      }

      // Store credentials in localStorage for this session
      localStorage.setItem('supabase_url', supabaseUrl);
      localStorage.setItem('supabase_key', supabaseKey);
      
      showSuccess('Successfully connected to Supabase! Please refresh the page.');
      showInfo('Refreshing page in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      showError(`Connection failed: ${error.message || 'Invalid credentials'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Database size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Connect to Supabase
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Database Connection Required</p>
                <p>To save tests and user progress, please connect to your Supabase database.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="Your anon key here"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How to get these credentials:</strong><br />
              1. Go to your Supabase dashboard<br />
              2. Select your project<br />
              3. Go to Settings → API<br />
              4. Copy the Project URL and anon/public key
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Skip for Now
            </button>
            <button
              onClick={handleConnect}
              disabled={isConnecting || !supabaseUrl || !supabaseKey}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetup;