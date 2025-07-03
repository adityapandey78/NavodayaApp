import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // Get all live tests
  async getLiveTests(): Promise<DatabaseTest[]> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('is_live', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tests:', error);
      return [];
    }

    return data || [];
  },

  // Get all tests (for admin)
  async getAllTests(): Promise<DatabaseTest[]> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all tests:', error);
      return [];
    }

    return data || [];
  },

  // Create a new test
  async createTest(testData: any): Promise<DatabaseTest | null> {
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
      return null;
    }

    return data;
  },

  // Update a test
  async updateTest(id: string, testData: any): Promise<DatabaseTest | null> {
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
      return null;
    }

    return data;
  },

  // Toggle test live status
  async toggleTestStatus(id: string, isLive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('tests')
      .update({ is_live: isLive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling test status:', error);
      return false;
    }

    return true;
  },

  // Delete a test
  async deleteTest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting test:', error);
      return false;
    }

    return true;
  },

  // Get test by ID
  async getTestById(id: string): Promise<DatabaseTest | null> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching test:', error);
      return null;
    }

    return data;
  }
};

// Test attempt management functions
export const attemptService = {
  // Get user's test attempts
  async getUserAttempts(userId: string): Promise<DatabaseTestAttempt[]> {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user attempts:', error);
      return [];
    }

    return data || [];
  },

  // Save test attempt
  async saveAttempt(attemptData: any, userId: string): Promise<DatabaseTestAttempt | null> {
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
      return null;
    }

    return data;
  }
};

// Auth helper functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};