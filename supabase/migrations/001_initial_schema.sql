-- 001_initial_schema_updated.sql
-- GHS Kasala Abbottabad Schema Definition

-- Audit Logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Faculty
CREATE TABLE public.faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    qualification TEXT NOT NULL,
    subject_specialization TEXT NOT NULL,
    appointment_date DATE,
    charge_date DATE,
    address TEXT,
    photo_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    factor_id UUID,
    aal USER-DEFINED,
    not_after TIMESTAMPTZ,
    refreshed_at TIMESTAMP WITHOUT TIME ZONE,
    user_agent TEXT,
    ip INET,
    tag TEXT,
    oauth_client_id UUID,
    refresh_token_hmac_key TEXT,
    refresh_token_counter BIGINT,
    scopes TEXT
);

-- Settings
CREATE TABLE public.settings (
    id INTEGER PRIMARY KEY,
    school_name TEXT NOT NULL DEFAULT 'Government High School Kasala'::text,
    emis_code TEXT NOT NULL DEFAULT '21102001'::text,
    district TEXT NOT NULL DEFAULT 'Abbottabad'::text,
    province TEXT NOT NULL DEFAULT 'Khyber Pakhtunkhwa'::text,
    established TEXT NOT NULL DEFAULT '1975'::text,
    phone TEXT NOT NULL DEFAULT '+92 992 550123'::text,
    email TEXT NOT NULL DEFAULT 'info@ghskasala.edu.pk'::text,
    principal_name TEXT NOT NULL DEFAULT 'Mr. Muhammad Alam'::text,
    location_address TEXT NOT NULL DEFAULT 'Kasala, Abbottabad, Khyber Pakhtunkhwa, Pakistan'::text,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    hero_image_url TEXT,
    principal_message TEXT,
    hero_heading TEXT DEFAULT 'Empowering the Next Generation of Leaders'::text,
    principal_image_url TEXT,
    summer_timings TEXT DEFAULT '07:30 AM - 01:30 PM (Mon - Sat)'::text,
    winter_timings TEXT DEFAULT '08:30 AM - 02:00 PM (Mon - Sat)'::text,
    friday_hours TEXT DEFAULT 'Closing early at 12:00 PM'::text
    facebook_url TEXT DEFAULT '',
    twitter_url TEXT DEFAULT '',
    instagram_url TEXT DEFAULT '',
    youtube_url TEXT DEFAULT '';
);

-- Students
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_no INTEGER,
    roll_no INTEGER NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    session_id UUID REFERENCES public.sessions(id),
    doa DATE,
    dob DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    gender TEXT NOT NULL DEFAULT 'Unknown'::text,
    result_file_url TEXT
);

-- User Profiles
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Gallery
CREATE TABLE public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Essential for deleting the image from the bucket later
    caption TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- This serves as your exact Date and Time for sorting
);

-- Announcements
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT, -- Added to support flyers/banners
    publish_date DATE DEFAULT CURRENT_DATE,
    is_important BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);