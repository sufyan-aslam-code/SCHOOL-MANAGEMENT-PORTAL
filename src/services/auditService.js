import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const auditService = {
  async logAction({ userEmail, action, entityType, details }) {
    if (!isSupabaseConfigured()) {
      return true;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_email: userEmail,
        action,
        entity_type: entityType,
        details: JSON.stringify(details)
      }]);

    if (error) console.error('Audit log failed:', error);
    return true;
  }
};

export default auditService;
