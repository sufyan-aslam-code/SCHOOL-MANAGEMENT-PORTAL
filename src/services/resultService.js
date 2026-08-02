import { supabase } from '../lib/supabase';

export const resultService = {

  /**
   * Get all published results (Admin Dashboard)
   */
  async getResults() {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];

    } catch (err) {
      console.error('Fetch Results Error:', err);

      throw new Error(
        err.message || 'Unable to fetch results.'
      );
    }
  },


  /**
   * Search a published student result
   */
  async searchResult({ sessionName, classCode, rollNo }) {
    try {
      const { data, error } = await supabase.rpc(
        'search_student_result',
        {
          p_session_name: sessionName,
          p_class_code: classCode,
          p_roll_no: rollNo.trim(),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      return data;

    } catch (err) {
      console.error('Result Search Error:', err);

      throw new Error(
        err.message || 'Unable to retrieve the student result.'
      );
    }
  },


  /**
   * Bulk upload (Admin only)
   */
  async batchUpsertResults(parsedRows) {
    try {

      const { data, error } = await supabase
        .from('results')
        .upsert(parsedRows);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        count: parsedRows.length,
        data
      };

    } catch (err) {
      console.error('Result Upload Error:', err);

      throw new Error(
        err.message || 'Failed to upload results.'
      );
    }
  },

};

export default resultService;