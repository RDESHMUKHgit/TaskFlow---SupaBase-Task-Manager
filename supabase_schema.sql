-- ==============================================================================
-- SUPABASE SCHEMA: Tasks Manager App (With Auth, RLS & Storage Attachments)
-- ==============================================================================
-- Idempotent schema: Safe to run multiple times without deleting existing data.
-- Paste this script into your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create public.users profile table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. Automatic Profile Creation Trigger: Sync auth.users -> public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Create tasks table with user_id Foreign Key and Attachment fields
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(50),
    attachment_size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration safety: If tasks table previously existed without new columns, add them safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'user_id') THEN
        ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'attachment_url') THEN
        ALTER TABLE public.tasks ADD COLUMN attachment_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'attachment_name') THEN
        ALTER TABLE public.tasks ADD COLUMN attachment_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'attachment_type') THEN
        ALTER TABLE public.tasks ADD COLUMN attachment_type VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'attachment_size') THEN
        ALTER TABLE public.tasks ADD COLUMN attachment_size BIGINT;
    END IF;
END $$;

-- Trigger for tasks table updated_at
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON public.tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category ON public.tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON public.tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES FOR DATABASE TABLES
-- ==============================================================================

-- Enable RLS on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Policies for public.users
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- B. Policies for public.tasks (Strict User-Isolation)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. SUPABASE STORAGE SETUP: task-attachments Bucket & Storage RLS
-- ==============================================================================

-- Create public storage bucket for task attachments if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-attachments',
    'task-attachments',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Authenticated users can upload task attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload task attachments"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'task-attachments' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Anyone can view task attachments" ON storage.objects;
CREATE POLICY "Anyone can view task attachments"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'task-attachments');

DROP POLICY IF EXISTS "Users can update own task attachments" ON storage.objects;
CREATE POLICY "Users can update own task attachments"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'task-attachments' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete own task attachments" ON storage.objects;
CREATE POLICY "Users can delete own task attachments"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'task-attachments' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
