-- 002_rls_updated.sql
-- Row Level Security Policies for GHS Kasala (Safe to re-run)

-- 1. Enable RLS on all active tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper function to check if user is authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Public Read Policies (Allow anyone to view necessary frontend data)

DROP POLICY IF EXISTS "Public read sessions" ON public.sessions;
CREATE POLICY "Public read sessions" ON public.sessions
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read classes" ON public.classes;
CREATE POLICY "Public read classes" ON public.classes
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read faculty" ON public.faculty;
CREATE POLICY "Public read faculty" ON public.faculty
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read students" ON public.students;
CREATE POLICY "Public read students" ON public.students
    FOR SELECT USING (TRUE);

-- 4. Admin Full Access Policies (Admins can do everything)

DROP POLICY IF EXISTS "Admins full access profiles" ON public.user_profiles;
CREATE POLICY "Admins full access profiles" ON public.user_profiles
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access sessions" ON public.sessions;
CREATE POLICY "Admins full access sessions" ON public.sessions
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access classes" ON public.classes;
CREATE POLICY "Admins full access classes" ON public.classes
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access students" ON public.students;
CREATE POLICY "Admins full access students" ON public.students
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access faculty" ON public.faculty;
CREATE POLICY "Admins full access faculty" ON public.faculty
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access settings" ON public.settings;
CREATE POLICY "Admins full access settings" ON public.settings
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access audit logs" ON public.audit_logs;
CREATE POLICY "Admins full access audit logs" ON public.audit_logs
    FOR ALL USING (public.is_admin());