import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const storageService = {
  async uploadFile(bucket, path, file) {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }
};

export default storageService;
