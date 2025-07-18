import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://doibiltyhcqvccsnggwl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaWJpbHR5aGNxdmNjc25nZ3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTYwMzMsImV4cCI6MjA2NzEzMjAzM30.INuR6Q_0AU5B0tjw51s25Jz7jC63GAL5CG0C84sRNDg';

// Initialize Supabase client
let supabase: SupabaseClient | null = null;
let isSupabaseAvailable = false;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseAvailable = true;
    console.log('✅ Supabase initialized successfully');
    console.log('🔗 URL:', supabaseUrl);
  } else {
    console.error('❌ Invalid Supabase credentials');
    throw new Error('Invalid Supabase configuration');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error);
  isSupabaseAvailable = false;
}

// Database types
export interface DatabaseTest {
  id: string;
  test_type: 'navodaya' | 'sainik';
  test_name: string;
  test_name_hi?: string;
  total_marks: number;
  test_date: string;
  duration_in_minutes: number;
  is_live: boolean;
  sections: any[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseTestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  test_type: string;
  test_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  duration: number;
  section_wise_score: any;
  user_answers: any[];
  completed_at: string;
  created_at: string;
}

// Cache management
const CACHE_KEYS = {
  TESTS: 'cached_tests',
  LAST_SYNC: 'last_sync_time'
};

const cacheService = {
  // Cache tests data
  cacheTests: (tests: any[]) => {
    try {
      localStorage.setItem(CACHE_KEYS.TESTS, JSON.stringify(tests));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Failed to cache tests:', error);
    }
  },

  // Get cached tests
  getCachedTests: (): any[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.TESTS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached tests:', error);
      return [];
    }
  },

  // Check if cache is valid (less than 1 hour old)
  isCacheValid: (): boolean => {
    try {
      const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
      if (!lastSync) return false;
      
      const lastSyncTime = new Date(lastSync).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      
      return (now - lastSyncTime) < oneHour;
    } catch {
      return false;
    }
  },

  // Clear cache
  clearCache: () => {
    localStorage.removeItem(CACHE_KEYS.TESTS);
    localStorage.removeItem(CACHE_KEYS.LAST_SYNC);
  }
};

// Network status checker
const networkService = {
  isOnline: () => navigator.onLine,
  
  // Check if we can reach Supabase with timeout
  checkSupabaseConnection: async (timeoutMs: number = 8000): Promise<boolean> => {
    if (!isSupabaseAvailable || !supabase) {
      console.warn('Supabase not available for connection check');
      return false;
    }
    
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs);
      });

      // Simple query to test connection
      const connectionPromise = supabase.from('tests').select('count', { count: 'exact', head: true });
      
      await Promise.race([connectionPromise, timeoutPromise]);
      
      console.log('✅ Supabase connection verified');
      return true;
    } catch (error: any) {
      console.warn('❌ Supabase connection check failed:', error.message);
      return false;
    }
  }
};

// Test management functions
export const testService = {
  // Check if Supabase is available
  isAvailable: () => isSupabaseAvailable && supabase,

  // Check network and Supabase connection with better error handling
  checkConnection: async (): Promise<boolean> => {
    // For admin functions, we need both network and Supabase
    // if (!skipNetworkCheck && !networkService.isOnline()) {
    //   throw new Error('No internet connection detected. Please check your network settings.');
    // }
    
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database connection not available. Please check your configuration.');
    }

    // Quick connection test with timeout
    const canReachSupabase = await networkService.checkSupabaseConnection(8000);
    if (!canReachSupabase) {
      throw new Error('Cannot reach database server. The server may be temporarily unavailable.');
    }
    
    return true;
  },

  // Get all live tests with caching
  async getLiveTests(): Promise<any[]> {
    try {
      // First try to get cached tests for immediate loading
      const cachedTests = cacheService.getCachedTests();
      
      // If we have cached tests and cache is valid, use them first
      if (cachedTests.length > 0 && cacheService.isCacheValid()) {
        console.log(`✅ Using cached tests (${cachedTests.length} tests)`);
        
        // Try to refresh in background if online
        if (isSupabaseAvailable && supabase && networkService.isOnline()) {
          this.refreshTestsInBackground();
        }
        
        return cachedTests;
      }
      
      // Try to fetch from Supabase if no valid cache
      if (isSupabaseAvailable && supabase) {
        try {
          const { data, error } = await supabase
            .from('tests')
            .select('*')
            .eq('is_live', true)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const formattedTests = data.map((test: DatabaseTest) => ({
              id: test.id,
              testType: test.test_type,
              testName: test.test_name,
              testNameHi: test.test_name_hi,
              totalMarks: test.total_marks,
              testDate: test.test_date,
              durationInMinutes: test.duration_in_minutes,
              isLive: test.is_live,
              sections: test.sections
            }));

            // Cache the tests
            cacheService.cacheTests(formattedTests);
            console.log(`✅ Loaded ${formattedTests.length} tests from database`);
            
            return formattedTests;
          }
        } catch (supabaseError) {
          console.warn('Supabase fetch failed:', supabaseError);
        }
      }
      
      // Fallback to cached tests even if expired
      if (cachedTests.length > 0) {
        console.warn('Using expired cached tests as fallback');
        return cachedTests;
      }
      
      // Final fallback to default tests
      console.warn('Loading default tests as final fallback');
      const module = await import('../data/testData');
      const defaultTests = module.availableTests || [];
      
      // Cache default tests
      cacheService.cacheTests(defaultTests);
      
      return defaultTests;
    } catch (error: any) {
      console.error('Error fetching tests from Supabase:', error);
      
      // Try to use cached data as fallback when database connection fails
      const cachedTests = cacheService.getCachedTests();
      if (cachedTests.length > 0) {
        console.warn('Using cached tests - database connection failed, falling back to cached data');
        return cachedTests;
      }
      
      // Only throw error if both live fetch and cached fallback fail
      console.error('All fallbacks failed, returning empty array');
      return [];
    }
  },

  // Background refresh method
  async refreshTestsInBackground(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_live', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedTests = data.map((test: DatabaseTest) => ({
          id: test.id,
          testType: test.test_type,
          testName: test.test_name,
          testNameHi: test.test_name_hi,
          totalMarks: test.total_marks,
          testDate: test.test_date,
          durationInMinutes: test.duration_in_minutes,
          isLive: test.is_live,
          sections: test.sections
        }));

        cacheService.cacheTests(formattedTests);
        console.log('✅ Background refresh completed');
      }
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  },

  // Get test by ID (with cache fallback for quiz-taking)
  async getTestById(id: string): Promise<any | null> {
    try {
      // First check cached tests
      const cachedTests = cacheService.getCachedTests();
      const cachedTest = cachedTests.find(t => t.id === id);
      
      if (cachedTest) {
        console.log('✅ Using cached test data');
        return cachedTest;
      }
      
      // Try Supabase if not in cache
      if (isSupabaseAvailable && supabase) {
        try {
          const { data, error } = await supabase
            .from('tests')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            return {
              id: data.id,
              testType: data.test_type,
              testName: data.test_name,
              testNameHi: data.test_name_hi,
              totalMarks: data.total_marks,
              testDate: data.test_date,
              durationInMinutes: data.duration_in_minutes,
              isLive: data.is_live,
              sections: data.sections
            };
          }
        } catch (supabaseError) {
          console.warn('Supabase fetch failed for test ID:', supabaseError);
        }
      }
      
      // Fallback to default tests
      const module = await import('../data/testData');
      const defaultTests = module.availableTests || [];
      const defaultTest = defaultTests.find(t => t.id === id);
      
      if (defaultTest) {
        console.log('✅ Using default test data');
        return defaultTest;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching test by ID:', error);
      return null;
    }
  },

  // Admin functions - ALWAYS require online connection
  async getAllTests(): Promise<DatabaseTest[]> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Failed to fetch tests: ${error.message}`);
    }

    return data || [];
  },

  async createTest(testData: any): Promise<DatabaseTest | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { data, error } = await supabase
      .from('tests')
      .insert([{
        test_type: testData.testType,
        test_name: testData.testName,
        test_name_hi: testData.testNameHi,
        total_marks: testData.totalMarks,
        test_date: testData.testDate,
        duration_in_minutes: testData.durationInMinutes,
        is_live: testData.isLive,
        sections: testData.sections
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create test: ${error.message}`);
    }

    // Clear cache to force refresh
    cacheService.clearCache();
    
    return data;
  },

  async updateTest(id: string, testData: any): Promise<DatabaseTest | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { data, error } = await supabase
      .from('tests')
      .update({
        test_type: testData.testType,
        test_name: testData.testName,
        test_name_hi: testData.testNameHi,
        total_marks: testData.totalMarks,
        test_date: testData.testDate,
        duration_in_minutes: testData.durationInMinutes,
        is_live: testData.isLive,
        sections: testData.sections
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update test: ${error.message}`);
    }

    // Clear cache to force refresh
    cacheService.clearCache();
    
    return data;
  },

  async toggleTestStatus(id: string, isLive: boolean): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { error } = await supabase
      .from('tests')
      .update({ is_live: isLive })
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to toggle test status: ${error.message}`);
    }

    // Clear cache to force refresh
    cacheService.clearCache();
    
    return true;
  },

  async deleteTest(id: string): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete test: ${error.message}`);
    }

    // Clear cache to force refresh
    cacheService.clearCache();
    
    return true;
  }
};

// Test attempt management functions
export const attemptService = {
  // Save pending attempts locally when offline
  savePendingAttempt: (attemptData: any, userId: string) => {
    try {
      const pending = JSON.parse(localStorage.getItem('pending_attempts') || '[]');
      pending.push({ ...attemptData, userId, timestamp: Date.now() });
      localStorage.setItem('pending_attempts', JSON.stringify(pending));
    } catch (error) {
      console.error('Failed to save pending attempt:', error);
    }
  },

  // Get pending attempts
  getPendingAttempts: (): any[] => {
    try {
      return JSON.parse(localStorage.getItem('pending_attempts') || '[]');
    } catch {
      return [];
    }
  },

  // Clear pending attempts
  clearPendingAttempts: () => {
    localStorage.removeItem('pending_attempts');
  },

  // Sync pending attempts when back online
  async syncPendingAttempts(): Promise<void> {
    const pending = this.getPendingAttempts();
    if (pending.length === 0) return;

    try {
      await testService.checkConnection();
      
      for (const attempt of pending) {
        await this.saveAttempt(attempt, attempt.userId);
      }
      
      this.clearPendingAttempts();
    } catch (error: any) {
      console.error('Failed to sync pending attempts:', error);
      throw new Error(`Failed to sync pending attempts: ${error.message}`);
    }
  },

  // Get user's test attempts
  async getUserAttempts(userId: string): Promise<any[]> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Failed to fetch attempts: ${error.message}`);
    }

    return (data || []).map((attempt: DatabaseTestAttempt) => ({
      id: attempt.id,
      testId: attempt.test_id,
      testType: attempt.test_type as 'navodaya' | 'sainik',
      testName: attempt.test_name,
      score: attempt.score,
      totalMarks: attempt.total_marks,
      percentage: attempt.percentage,
      date: attempt.completed_at,
      duration: attempt.duration,
      sectionWiseScore: attempt.section_wise_score
    }));
  },

  // Save test attempt (requires online connection)
  async saveAttempt(attemptData: any, userId: string): Promise<DatabaseTestAttempt | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Database not available');
    }
    
    const { data, error } = await supabase
      .from('test_attempts')
      .insert([{
        user_id: userId,
        test_id: attemptData.testId,
        test_type: attemptData.testType,
        test_name: attemptData.testName,
        score: attemptData.score,
        total_marks: attemptData.totalMarks,
        percentage: attemptData.percentage,
        duration: attemptData.duration,
        section_wise_score: attemptData.sectionWiseScore,
        user_answers: attemptData.userAnswers || []
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      
      // Handle duplicate attempt errors gracefully
      if (error.message.includes('duplicate') || error.message.includes('unique') || 
          error.message.includes('Duplicate test attempt')) {
        console.log('Duplicate attempt detected at database level, ignoring');
        // Return null to indicate duplicate was handled
        return null;
      }
      
      throw new Error(`Failed to save attempt: ${error.message}`);
    }

    return data;
  }
};

// Auth helper functions
export const authService = {
  // Check if auth is available
  isAvailable: () => isSupabaseAvailable && supabase,

  // Sign up with email and password
  async signUp(email: string, password: string) {
    if (!isSupabaseAvailable || !supabase) {
      return { data: null, error: new Error('Authentication not available') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      console.error('Supabase auth error:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!isSupabaseAvailable || !supabase) {
      return { data: null, error: new Error('Authentication not available') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      console.error('Supabase auth error:', error);
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    if (!isSupabaseAvailable || !supabase) {
      return { error: new Error('Authentication not available') };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Supabase auth error:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    if (!isSupabaseAvailable || !supabase) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Supabase auth error:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseAvailable || !supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Supabase auth error:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Export the supabase client and availability status
export { supabase, isSupabaseAvailable, networkService, cacheService };