-- 004_storage_updated.sql
-- Storage Buckets & Policies (Safe to re-run)

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('school-assets', 'school-assets', true),
('faculty', 'faculty', true),
('students', 'students', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public Read Policies for Storage
DROP POLICY IF EXISTS "Public Access school-assets" ON storage.objects;
CREATE POLICY "Public Access school-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Public Access faculty" ON storage.objects;
CREATE POLICY "Public Access faculty" ON storage.objects
    FOR SELECT USING (bucket_id = 'faculty');

DROP POLICY IF EXISTS "Public Access students" ON storage.objects;
CREATE POLICY "Public Access students" ON storage.objects
    FOR SELECT USING (bucket_id = 'students');

-- 3. Admin Upload/Manage Policies for Storage
DROP POLICY IF EXISTS "Admin Manage school-assets" ON storage.objects;
CREATE POLICY "Admin Manage school-assets" ON storage.objects
    FOR ALL USING (bucket_id = 'school-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Manage faculty" ON storage.objects;
CREATE POLICY "Admin Manage faculty" ON storage.objects
    FOR ALL USING (bucket_id = 'faculty' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Manage students" ON storage.objects;
CREATE POLICY "Admin Manage students" ON storage.objects
    FOR ALL USING (bucket_id = 'students' AND public.is_admin());