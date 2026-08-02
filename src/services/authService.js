import { supabase, isSupabaseConfigured } from '../lib/supabase';

if (!isSupabaseConfigured()) {
  throw new Error(
    'Supabase is not configured. Please check your environment variables.'
  );
}

export const authService = {
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to load user profile:', profileError);
      throw new Error('Unable to load user profile.');
    }

    if (!profile) {
      throw new Error(
        'No profile found for this account. Please contact the administrator.'
      );
    }

    return {
      ...user,
      role: profile.role,
      profile,
    };
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  },

  async refreshSession() {
    const {
      data,
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  },
};

export default authService;