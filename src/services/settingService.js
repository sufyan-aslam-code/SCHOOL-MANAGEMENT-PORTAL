import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const settingService = {
  async getSettings() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client is not configured');
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || {};
  },

  async updateSettings(newSettings) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client is not configured');
    }

    const { data, error } = await supabase
      .from('settings')
      .upsert([{ ...newSettings, id: 1 }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default settingService;