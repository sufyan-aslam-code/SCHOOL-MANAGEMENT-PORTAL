import { supabase, isSupabaseConfigured } from '../lib/supabase';

const mockStudentsList = [
  { id: '1', student_code: 'STU-1001', roll_no: '1001', name: 'Muhammad Hassan Khan', father_name: 'Tariq Mehmood', class_code: '10th', session_name: '2024-2025' },
  { id: '2', student_code: 'STU-1002', roll_no: '1002', name: 'Ali Ahmed', father_name: 'Shahid Ahmed', class_code: '10th', session_name: '2024-2025' },
  { id: '3', student_code: 'STU-901', roll_no: '901', name: 'Zeeshan Omar', father_name: 'Omar Farooq', class_code: '9th', session_name: '2024-2025' },
];

export const studentService = {
  async getStudents(filters = {}) {
    if (!isSupabaseConfigured()) {
      return mockStudentsList;
    }

    let query = supabase
      .from('students')
      .select('*')
      .order('roll_no', { ascending: true });

    if (filters.classCode) {
      query = query.eq('class_code', filters.classCode);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async addStudent(studentData) {
    if (!isSupabaseConfigured()) {
      const newStu = { id: Date.now().toString(), ...studentData };
      mockStudentsList.push(newStu);
      return newStu;
    }

    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStudent(id, studentData) {
    if (!isSupabaseConfigured()) {
      return { id, ...studentData };
    }

    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteStudent(id) {
    if (!isSupabaseConfigured()) {
      return true;
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export default studentService;