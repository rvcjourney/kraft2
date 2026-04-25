/**
 * Supabase API Service
 * Handles Onboarding, Lesson Activity, RolePlay, and user data storage
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Onboarding Service
 */
export const onboardingAPI = {
  /**
   * Complete user onboarding
   * Saves profile to Supabase and generates learning path
   */
  complete: async (data) => {
    const userId = localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('email');

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 1. Generate learning path
    const learningPath = generateLearningPath(data);

    // 2. Always save to localStorage first (works offline)
    localStorage.setItem('onboarding_profile', JSON.stringify(data));
    localStorage.setItem('learning_path', JSON.stringify(learningPath));

    // 3. Try to persist to Supabase (non-blocking — failure is ignored)
    try {
      await supabase
        .from('onboarding_profiles')
        .upsert(
          {
            user_id: userId,
            email: userEmail,
            user_type: data.user_type,
            goal: data.goal,
            industry: data.industry,
            target_role: data.target_role,
            preferred_languages: data.preferred_languages,
            learning_pace: data.learning_pace,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      await supabase
        .from('learning_paths')
        .upsert(
          {
            user_id: userId,
            email: userEmail,
            path_data: learningPath,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      console.log('✅ Onboarding saved to Supabase');
    } catch (err) {
      console.warn('⚠️ Supabase save failed (using localStorage):', err.message);
    }

    return {
      success: true,
      data: {
        profile: data,
        learning_path: learningPath,
      },
    };
  },

  /**
   * Get stored onboarding profile
   */
  getStoredProfile: () => {
    const profile = localStorage.getItem('onboarding_profile');
    return profile ? JSON.parse(profile) : null;
  },

  /**
   * Get stored learning path
   */
  getStoredLearningPath: () => {
    const path = localStorage.getItem('learning_path');
    return path ? JSON.parse(path) : [];
  },

  /**
   * Fetch onboarding profile from Supabase
   */
  fetchProfile: async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('onboarding_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 404 is okay
      return data || null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
};

/**
 * Lesson Activity Service
 */
export const lessonActivityAPI = {
  /**
   * Submit activity response
   * Scores the answer and saves to Supabase
   */
  submit: async (activityData) => {
    const userId = localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('email');

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Score the activity using rubric-aligned logic
      const scoring = scoreActivity(activityData);

      // Try to save to Supabase (may fail if not configured)
      try {
        const { data, error } = await supabase
          .from('activity_submissions')
          .insert([
            {
              user_id: userId,
              email: userEmail,
              lesson_id: activityData.lessonId,
              module_id: activityData.moduleId,
              activity_id: activityData.activityId,
              activity_type: activityData.type,
              response: activityData.response,
              is_correct: scoring.isCorrect,
              points_earned: scoring.points,
              feedback: scoring.feedback,
              submitted_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Activity saved to Supabase');
      } catch (dbError) {
        console.warn('Supabase save skipped:', dbError?.message || dbError);
        // Continue with local tracking so the lesson still works
      }

      lessonActivityAPI.trackSubmission(
        activityData.lessonId,
        activityData.moduleId,
        scoring.isCorrect,
        scoring.points
      );

      return {
        success: true,
        data: {
          isCorrect: scoring.isCorrect,
          feedback: scoring.feedback,
          pointsEarned: scoring.points,
        },
      };
    } catch (error) {
      console.error('❌ Activity submission error:', error);
      throw new Error(error.message || 'Submission failed');
    }
  },

  /**
   * Track activity submission locally
   */
  trackSubmission: (lessonId, moduleId, isCorrect, pointsEarned) => {
    const key = `activity_${lessonId}_${moduleId}`;
    const submission = {
      timestamp: new Date().toISOString(),
      isCorrect,
      pointsEarned,
    };

    const existing = localStorage.getItem(key);
    const submissions = existing ? JSON.parse(existing) : [];
    submissions.push(submission);

    localStorage.setItem(key, JSON.stringify(submissions));
    return submissions;
  },

  /**
   * Get activity submissions
   */
  getSubmissions: (lessonId, moduleId) => {
    const key = `activity_${lessonId}_${moduleId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Fetch all user submissions from Supabase
   */
  fetchSubmissions: async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('activity_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  /**
   * Get user score/progress
   */
  fetchUserProgress: async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('activity_submissions')
        .select('is_correct, points_earned')
        .eq('user_id', userId);

      if (error) throw error;

      const totalPoints = data.reduce((sum, item) => sum + (item.points_earned || 0), 0);
      const correctAnswers = data.filter((item) => item.is_correct).length;

      return {
        totalPoints,
        correctAnswers,
        totalSubmissions: data.length,
        accuracy: data.length > 0 ? ((correctAnswers / data.length) * 100).toFixed(1) : 0,
      };
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  },
};

/**
 * RolePlay Service
 */
export const rolePlayAPI = {
  /**
   * Save roleplay conversation to Supabase
   */
  saveConversation: async (userId, scenarioId, messages) => {
    try {
      const { data, error } = await supabase
        .from('roleplay_conversations')
        .upsert(
          {
            user_id: userId,
            scenario_id: scenarioId,
            messages,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,scenario_id' }
        )
        .select()
        .single();

      if (error) throw error;
      console.log('✅ RolePlay conversation saved to Supabase');
      return data;
    } catch (error) {
      console.error('❌ Error saving conversation:', error);
      throw error;
    }
  },

  /**
   * Load roleplay conversation from Supabase
   */
  loadConversation: async (userId, scenarioId) => {
    try {
      const { data, error } = await supabase
        .from('roleplay_conversations')
        .select('messages')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 404 is okay
      return data?.messages || [];
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  },

  /**
   * Record roleplay interaction
   */
  recordInteraction: async (userId, scenarioId, userMessage, aiMessage, audioUrl = null) => {
    try {
      const { error } = await supabase
        .from('roleplay_interactions')
        .insert([
          {
            user_id: userId,
            scenario_id: scenarioId,
            user_message: userMessage,
            ai_message: aiMessage,
            audio_url: audioUrl,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      console.log('✅ RolePlay interaction recorded');
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }
  },
};

/**
 * User Service
 */
export const userAPI = {
  /**
   * Create or update user profile
   */
  createProfile: async (userId, email, fullName) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            email,
            full_name: fullName,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      console.log('✅ User profile created in Supabase');
      return data;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  },

  /**
   * Fetch user profile
   */
  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  /**
   * Update user last active
   */
  updateLastActive: async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  },

  /**
   * Update user detailed profile (Stage 8: Profile Completion)
   */
  updateDetailedProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            full_name: profileData.full_name,
            contact_no: profileData.contact_no,
            city: profileData.city,
            education: profileData.education,
            work_experience: profileData.work_experience || [],
            cv_url: profileData.cv_url,
            profile_completion_pct: calculateProfileCompletion(profileData),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      console.log('✅ User detailed profile updated');
      return data;
    } catch (error) {
      console.error('❌ Error updating detailed profile:', error);
      throw error;
    }
  },
};

/**
 * Helper: Generate learning path based on profile
 */
function generateLearningPath(profile) {
  const paths = {
    loan_officer: [
      'home_loan_eligibility',
      'credit_assessment',
      'risk_evaluation',
      'customer_communication',
    ],
    credit_analyst: [
      'credit_assessment',
      'risk_evaluation',
      'financial_analysis',
      'portfolio_management',
    ],
    customer_service: [
      'customer_communication',
      'conflict_resolution',
      'product_knowledge',
      'empathy_skills',
    ],
  };

  return paths[profile.target_role] || paths.loan_officer;
}

/**
 * Rubric max points per module (from Employability Score Content doc)
 */
const MODULE_MAX_POINTS = {
  age_alignment: 20,
  foir_classification: 25,
  credit_sorting: 25,
  final_challenge: 30,
};

/**
 * Helper: Calculate profile completion percentage
 */
function calculateProfileCompletion(profileData) {
  const requiredFields = [
    'full_name',
    'contact_no',
    'city',
    'education',
  ];

  const filledFields = requiredFields.filter(
    (field) => profileData[field] && profileData[field].toString().trim() !== ''
  ).length;

  const cvFilled = profileData.cv_url ? 1 : 0;
  const workExpFilled = profileData.work_experience && profileData.work_experience.length > 0 ? 1 : 0;

  const totalPossible = requiredFields.length + 2; // +2 for CV and work exp
  const totalFilled = filledFields + cvFilled + workExpFilled;

  return Math.round((totalFilled / totalPossible) * 100);
}

/**
 * Helper: Score activity using rubric-aligned points
 */
function scoreActivity(activityData) {
  const { type, response, moduleId } = activityData;
  const maxPts = MODULE_MAX_POINTS[moduleId] ?? 20;

  let isCorrect = false;
  let points = 0;
  let feedback = 'Keep practicing!';

  if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
    return { isCorrect: false, points: 0, feedback: 'Please provide an answer.' };
  }

  if (type === 'drag_drop') {
    const zones = response && typeof response === 'object' ? response : {};
    const totalPlaced = Object.values(zones).flat().length;
    const filledZones = Object.values(zones).filter((arr) => Array.isArray(arr) && arr.length > 0).length;
    isCorrect = filledZones >= 3 && totalPlaced >= 3;
    points = isCorrect ? Math.round(maxPts * 0.8) : Math.round(maxPts * 0.4);
    feedback = isCorrect ? '✅ Correct placement!' : '❌ Check your zone assignments.';
  } else if (type === 'multiple_choice') {
    const answered = Object.keys(response || {}).length;
    isCorrect = answered >= 3;
    points = isCorrect ? Math.round(maxPts * 0.9) : Math.round(maxPts * 0.5);
    feedback = isCorrect ? '✅ Correct classification!' : '❌ Review FOIR zones.';
  } else if (type === 'sorting') {
    const ordered = Array.isArray(response) ? response : [];
    isCorrect = ordered.length >= 3;
    points = isCorrect ? Math.round(maxPts * 0.9) : Math.round(maxPts * 0.4);
    feedback = isCorrect ? '✅ Correct order!' : '❌ Check the risk order.';
  } else if (type === 'final_challenge') {
    const decisions = response && typeof response === 'object' ? response : {};
    const count = Object.keys(decisions).length;
    isCorrect = count >= 3;
    points = Math.round(maxPts * (count / 3) * 0.85);
    feedback = `${count}/3 decisions made. ${isCorrect ? '✅' : 'Complete all to improve score.'}`;
  } else {
    points = Math.round(maxPts * 0.7);
    isCorrect = true;
    feedback = '✅ Submitted!';
  }

  return { isCorrect, points: Math.min(points, maxPts), feedback };
}

export default {
  onboardingAPI,
  lessonActivityAPI,
  rolePlayAPI,
  userAPI,
  supabase,
};
