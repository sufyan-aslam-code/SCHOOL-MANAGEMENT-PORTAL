import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const announcementService = {
  async getAnnouncements(publicOnly = false) {
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured.');

    let query = supabase
      .from('announcements')
      .select('*')
      .order('is_important', { ascending: false })
      .order('publish_date', { ascending: false });

    if (publicOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async addAnnouncement(announcement) {
    const { data, error } = await supabase.from('announcements').insert([announcement]).select().single();
    if (error) throw error;
    return data;
  },

  async updateAnnouncement(id, updatedData) {
    const { data, error } = await supabase.from('announcements').update(updatedData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export default announcementService;