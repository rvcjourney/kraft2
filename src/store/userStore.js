import { create } from 'zustand';

/**
 * User Store - Manages authentication state
 */
export const useUserStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // This will be called from component
      // Component will call authAPI.login() then setUser()
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  clearError: () => set({ error: null }),
}));

/**
 * Onboarding Store - Manages user profile and learning path
 */
export const useOnboardingStore = create((set) => ({
  // State
  profile: null,
  learningPath: [],
  currentModuleIndex: 0,
  loading: false,
  error: null,
  completed: false,
  userType: '',
  industry: '',
  preferredLanguages: ['en'],

  // Actions
  setProfile: (profile) =>
    set({
      profile,
      error: null,
    }),

  setUserType: (userType) =>
    set({
      userType,
      error: null,
    }),

  setIndustry: (industry) =>
    set({
      industry,
      error: null,
    }),

  setPreferredLanguages: (preferredLanguages) =>
    set({
      preferredLanguages,
      error: null,
    }),

  setLearningPath: (learningPath) =>
    set({
      learningPath,
      currentModuleIndex: 0,
    }),

  setCompleted: (completed) => set({ completed }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  nextModule: () =>
    set((state) => ({
      currentModuleIndex: Math.min(
        state.currentModuleIndex + 1,
        state.learningPath.length - 1
      ),
    })),

  previousModule: () =>
    set((state) => ({
      currentModuleIndex: Math.max(state.currentModuleIndex - 1, 0),
    })),

  getCurrentModule: () =>
    ((state) =>
      state.learningPath[state.currentModuleIndex] || null),

  clearError: () => set({ error: null }),
}));

/**
 * Lesson Store - Manages lesson progress and activities
 */
export const useLessonStore = create((set, get) => ({
  // State
  currentLesson: 'home_loan_eligibility',
  currentModule: 'age_alignment',
  activities: {},
  scores: {},
  submissions: {},
  loading: false,
  error: null,

  // Actions
  setCurrentLesson: (lesson) =>
    set({
      currentLesson: lesson,
      currentModule: 'age_alignment', // Reset to first module
    }),

  setCurrentModule: (module) =>
    set({
      currentModule: module,
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  recordSubmission: (moduleId, submission) =>
    set((state) => ({
      submissions: {
        ...state.submissions,
        [moduleId]: [
          ...(state.submissions[moduleId] || []),
          submission,
        ],
      },
    })),

  recordScore: (moduleId, score) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [moduleId]: score,
      },
    })),

  getModuleScore: (moduleId) =>
    get().scores[moduleId] || 0,

  getModuleAttempts: (moduleId) =>
    get().submissions[moduleId]?.length || 0,

  getModuleCorrect: (moduleId) =>
    get().submissions[moduleId]?.filter(s => s.isCorrect)
      .length || 0,

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      currentLesson: 'home_loan_eligibility',
      currentModule: 'age_alignment',
      activities: {},
      scores: {},
      submissions: {},
      error: null,
    }),
}));

export default {
  useUserStore,
  useOnboardingStore,
  useLessonStore,
};
