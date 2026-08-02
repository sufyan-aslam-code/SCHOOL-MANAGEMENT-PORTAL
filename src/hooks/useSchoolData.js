// src/hooks/useSchoolData.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useClasses() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClasses() {
            const { data, error } = await supabase
                .from('classes')
                .select('id, code, name')
                .order('display_order', { ascending: true });

            if (!error && data) setClasses(data);
            setLoading(false);
        }
        fetchClasses();
    }, []);

    return { classes, loading };
}

export function useSessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSessions() {
            const { data, error } = await supabase
                .from('sessions')
                .select('id, name, is_active')
                .order('name', { ascending: false });

            if (!error && data) setSessions(data);
            setLoading(false);
        }
        fetchSessions();
    }, []);

    return { sessions, loading };
}

export function useStudents(classId = null, sessionId = null) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('students')
                .select(`
                    id,
                    name,
                    father_name,
                    roll_no,
                    gender,
                    class_id,
                    session_id,
                    result_file_url,
                    classes!students_class_id_fkey (name),
                    sessions!students_session_id_fkey (name)
                `)
                .order('roll_no', { ascending: true });

            if (classId) query = query.eq('class_id', classId);
            if (sessionId) query = query.eq('session_id', sessionId);

            const { data, error: supabaseError } = await query;

            if (supabaseError) throw supabaseError;

            const formattedData = data.map(student => ({
                ...student,
                class_name: student.classes?.name,
                session_name: student.sessions?.name
            }));

            setStudents(formattedData);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [classId, sessionId]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    return { students, loading, error, mutate: fetchStudents };
}