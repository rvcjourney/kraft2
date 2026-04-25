/**
 * Local Authentication Service with Supabase Integration
 * Mirrors n8n auth workflow - saves users to Supabase
 */

import { supabase } from './supabaseAPI';

const CURRENT_USER_KEY = 'careercraft_current_user';
const NETWORK_ERROR_MESSAGE =
  'Cannot connect to Supabase right now. Check internet, VPN/proxy, firewall, or Supabase project status and try again.';

function isNetworkError(error) {
  if (!error) return false;

  const raw = [
    error.message,
    error.details,
    error.hint,
    error.error_description,
    error.name,
    error.code,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    raw.includes('failed to fetch') ||
    raw.includes('networkerror') ||
    raw.includes('timed out') ||
    raw.includes('timeout') ||
    raw.includes('err_connection_timed_out') ||
    raw.includes('load failed')
  );
}

/**
 * Simple SHA256 hash (matches n8n implementation)
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new user - saves to BOTH Supabase AND localStorage
 */
export async function register(email, password, fullName) {
  try {
    // Validation
    if (!email || !password || !fullName) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      };
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email',
      };
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email exists in Supabase
    console.log('🔍 Checking if email exists in Supabase...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower);

    if (checkError) {
      console.error('⚠️ Error checking email:', checkError);
      return {
        success: false,
        error: isNetworkError(checkError)
          ? NETWORK_ERROR_MESSAGE
          : 'Could not check if email exists: ' + checkError.message,
      };
    }

    if (existingUsers && existingUsers.length > 0) {
      return {
        success: false,
        error: 'Email already registered',
      };
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    // Save to Supabase
    console.log('💾 Saving user to Supabase...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: emailLower,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError);
      return {
        success: false,
        error: isNetworkError(insertError)
          ? NETWORK_ERROR_MESSAGE
          : 'Failed to create account: ' + insertError.message,
      };
    }

    console.log('✅ User saved to Supabase:', newUser.id);

    // Create session
    const sessionToken = Math.random().toString(36).substr(2) + Date.now().toString(36);

    // Store in localStorage
    localStorage.setItem('user_id', newUser.id);
    localStorage.setItem('email', emailLower);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
      id: newUser.id,
      email: emailLower,
      fullName: fullName,
      token: sessionToken,
    }));

    // Also save to user_profiles for additional info
    try {
      await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: newUser.id,
            full_name: fullName,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    } catch (profileError) {
      console.warn('⚠️ Could not save to user_profiles:', profileError?.message);
    }

    console.log('✅ Registration successful:', { id: newUser.id, email: emailLower });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: emailLower,
        fullName: fullName,
        token: sessionToken,
      },
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return {
      success: false,
      error: isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error.message || 'Registration failed',
    };
  }
}

/**
 * Login user - validates against Supabase
 */
export async function login(email, password) {
  try {
    // Validation
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    const emailLower = email.toLowerCase().trim();

    // Get user from Supabase
    console.log('🔍 Looking up user in Supabase...');
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', emailLower);

    if (queryError) {
      console.error('⚠️ Database error:', queryError);
      return {
        success: false,
        error: isNetworkError(queryError)
          ? NETWORK_ERROR_MESSAGE
          : 'Database error: ' + queryError.message,
      };
    }

    if (!users || users.length === 0) {
      return {
        success: false,
        error: 'Email or password is incorrect',
      };
    }

    const user = users[0];

    // Hash input password
    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    // Compare passwords
    if (passwordHash !== user.password_hash) {
      return {
        success: false,
        error: 'Email or password is incorrect',
      };
    }

    // Create session
    const sessionToken = Math.random().toString(36).substr(2) + Date.now().toString(36);

    // Store in localStorage
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('email', emailLower);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
      id: user.id,
      email: emailLower,
      token: sessionToken,
    }));

    console.log('✅ Login successful:', { id: user.id, email: emailLower });

    return {
      success: true,
      user: {
        id: user.id,
        email: emailLower,
        token: sessionToken,
      },
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    return {
      success: false,
      error: isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error.message || 'Login failed',
    };
  }
}

/**
 * Get current logged in user
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Logout current user
 */
export function logout() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    console.log('✅ Logged out');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

/**
 * Get stored user (for compatibility)
 */
export function getStoredUser() {
  return getCurrentUser();
}

/**
 * Create a demo user for testing
 */
export async function createDemoUser() {
  try {
    const demoEmail = 'demo@careercraft.local';

    // Check if demo user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', demoEmail);

    if (existing && existing.length > 0) {
      console.log('✅ Demo user already exists');
      return;
    }

    // Create demo user
    const demoPassword = 'demo123';
    const passwordHash = await hashPassword(demoPassword);

    const { data: demoUser, error } = await supabase
      .from('users')
      .insert([
        {
          email: demoEmail,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Could not create demo user:', error.message);
      return;
    }

    console.log('✅ Demo user created (email: demo@careercraft.local, password: demo123)');
  } catch (error) {
    console.warn('⚠️ Demo user creation error:', error.message);
  }
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  createDemoUser,
};
