import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks to localStorage
const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || 
         localStorage.getItem('supabase_url') || 
         '';
};

const getSupabaseKey = () => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 
         localStorage.getItem('supabase_key') || 
         '';
};

// Only create client if we have valid credentials
let supabase: any = null;
let isSupabaseAvailable = false;

const initializeSupabase = () => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseKey();

  try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      isSupabaseAvailable = true;
      console.log('✅ Supabase initialized successfully');
    } else {
      console.warn('⚠️ Supabase credentials not available or invalid. Running in offline mode.');
      isSupabaseAvailable = false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    isSupabaseAvailable = false;
  }
};

// Initialize on load
initializeSupabase();

// Re-initialize when storage changes
window.addEventListener('storage', initializeSupabase);

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

// Test management functions
export const testService = {
  // Check if Supabase is available
  isAvailable: () => isSupabaseAvailable && supabase,

  // Re-initialize connection
  reconnect: () => {
    initializeSupabase();
    return isSupabaseAvailable;
  },

  // Get all live tests
  async getLiveTests(): Promise<DatabaseTest[]> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_live', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Get all tests (for admin)
  async getAllTests(): Promise<DatabaseTest[]> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all tests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Create a new test
  async createTest(testData: any): Promise<DatabaseTest | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
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
        console.error('Error creating test:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Update a test
  async updateTest(id: string, testData: any): Promise<DatabaseTest | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
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
        console.error('Error updating test:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Toggle test live status
  async toggleTestStatus(id: string, isLive: boolean): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
      const { error } = await supabase
        .from('tests')
        .update({ is_live: isLive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling test status:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Delete a test
  async deleteTest(id: string): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting test:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Get test by ID
  async getTestById(id: string): Promise<DatabaseTest | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching test:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  }
};

// Test attempt management functions
export const attemptService = {
  // Get user's test attempts
  async getUserAttempts(userId: string): Promise<DatabaseTestAttempt[]> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user attempts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  },

  // Save test attempt
  async saveAttempt(attemptData: any, userId: string): Promise<DatabaseTestAttempt | null> {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Supabase not available');
    }

    try {
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
        console.error('Error saving attempt:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
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
export { supabase, isSupabaseAvailable };