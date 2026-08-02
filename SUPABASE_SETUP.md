# Supabase Database Setup & Migration Guide

This guide details how to configure a production Supabase project for **Government High School Kasala Abbottabad**.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Set **Project Name**: `ghs-kasala-portal`.
4. Choose a strong Database Password and select your nearest region.

---

## 2. Environment Variables Setup

Once your project is created, navigate to **Project Settings -> API** and copy your credentials:

Create or update `.env` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

---

## 3. Execute SQL Migrations

Navigate to the **SQL Editor** in your Supabase Dashboard and run the migration files located in `supabase/migrations/` in sequential order:

### Step 3.1: Table Definitions (`001_initial_schema.sql`)
Copy and run [001_initial_schema.sql](file:///c:/Users/sufya/Documents/AI%20Tools/Antigravity/ghs-kasala/supabase/migrations/001_initial_schema.sql).
* Creates `user_profiles`, `sessions`, `classes`, `subjects`, `students`, `faculty`, `results`, `result_items`, `notices`, `gallery`, `settings`, and `audit_logs`.

### Step 3.2: Row Level Security (`002_rls.sql`)
Copy and run [002_rls.sql](file:///c:/Users/sufya/Documents/AI%20Tools/Antigravity/ghs-kasala/supabase/migrations/002_rls.sql).
* Configures RLS policies granting public read access to published results, notices, and faculty, while restricting write operations to authorized admins.

### Step 3.3: Database Indexes (`003_indexes.sql`)
Copy and run [003_indexes.sql](file:///c:/Users/sufya/Documents/AI%20Tools/Antigravity/ghs-kasala/supabase/migrations/003_indexes.sql).
* Creates performance indexes on student roll numbers, class IDs, and notice publication dates.


### Step 3.5: Storage Buckets (`005_storage.sql`)
Copy and run [005_storage.sql](file:///c:/Users/sufya/Documents/AI%20Tools/Antigravity/ghs-kasala/supabase/migrations/005_storage.sql).
* Configures public storage buckets: `school-assets`, `faculty`, `students`, `gallery`.

---

## 4. Create Initial Administrator Account

1. In Supabase Dashboard, go to **Authentication -> Users** and click **Add User -> Create User**.
2. Email: `[EMAIL_ADDRESS]`
3. Password: Choose a secure password.
4. Copy the newly created User ID (`UUID`).
5. Open **SQL Editor** and run the following query to assign admin permissions:

```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES ('PASTE-USER-UUID-HERE', [EMAIL_ADDRESS]', 'Principal / Admin', 'admin');
```
