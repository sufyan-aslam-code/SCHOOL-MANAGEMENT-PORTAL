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
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
CREATE POLICY "Public can view gallery" ON public.gallery 
    FOR SELECT USING (TRUE);

-- Notice: Public can ONLY read announcements where is_active is true
DROP POLICY IF EXISTS "Public read active announcements" ON public.announcements;
CREATE POLICY "Public read active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);


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

DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery" ON public.gallery 
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins full access announcements" ON public.announcements;
CREATE POLICY "Admins full access announcements" ON public.announcements
    FOR ALL USING (public.is_admin());


-- 5. Storage Buckets Setup & Policies (For images/flyers)

-- Ensure the 'announcements' bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access for announcement images
DROP POLICY IF EXISTS "Public read announcement images" ON storage.objects;
CREATE POLICY "Public read announcement images" ON storage.objects 
    FOR SELECT USING (bucket_id = 'announcements');

-- Admin full access (upload/update/delete) for announcement images
DROP POLICY IF EXISTS "Admins manage announcement images" ON storage.objects;
CREATE POLICY "Admins manage announcement images" ON storage.objects 
    FOR ALL USING (bucket_id = 'announcements' AND auth.role() = 'authenticated');