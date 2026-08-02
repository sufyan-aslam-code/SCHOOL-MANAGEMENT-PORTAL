import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const facultyService = {
  async getFaculty() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addFaculty(member) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('faculty')
      .insert([member])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFaculty(id, updatedData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('faculty')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFaculty(id) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export default facultyService;