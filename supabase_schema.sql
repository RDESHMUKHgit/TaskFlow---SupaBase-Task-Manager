-- ==============================================================================
-- SUPABASE SCHEMA: Tasks Manager App
-- ==============================================================================
-- Idempotent schema: Safe to run multiple times without deleting existing data.
-- Paste this script into your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create tasks table if it does not already exist
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
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

-- 3. Drop existing trigger if needed and attach to tasks table
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Create indexes for high performance filtering and search
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. Create policies to allow public read/write for development (or customize per auth)
DROP POLICY IF EXISTS "Allow public read access" ON public.tasks;
CREATE POLICY "Allow public read access" ON public.tasks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.tasks;
CREATE POLICY "Allow public insert access" ON public.tasks
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.tasks;
CREATE POLICY "Allow public update access" ON public.tasks
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.tasks;
CREATE POLICY "Allow public delete access" ON public.tasks
    FOR DELETE USING (true);

-- 7. Insert sample tasks only if the table is currently empty
INSERT INTO public.tasks (title, description, status, priority, category, due_date, is_completed)
SELECT 'Setup Supabase & Express Backend', 'Configure database connection and create CRUD REST API routes with error validations.', 'completed', 'high', 'Development', CURRENT_DATE, true
WHERE NOT EXISTS (SELECT 1 FROM public.tasks);

INSERT INTO public.tasks (title, description, status, priority, category, due_date, is_completed)
SELECT 'Design Responsive Task Manager UI', 'Implement modern dark/light glassmorphic components using pure CSS and React.', 'in_progress', 'urgent', 'Design', CURRENT_DATE + INTERVAL '2 days', false
WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Design Responsive Task Manager UI');

INSERT INTO public.tasks (title, description, status, priority, category, due_date, is_completed)
SELECT 'Implement Task Filtering & Search', 'Add search by title, filter by category, status, and sort by priority or due date.', 'pending', 'medium', 'Feature', CURRENT_DATE + INTERVAL '5 days', false
WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Implement Task Filtering & Search');

INSERT INTO public.tasks (title, description, status, priority, category, due_date, is_completed)
SELECT 'Add Analytics & Progress Metrics', 'Create dashboard KPIs and task status distribution charts.', 'pending', 'low', 'Analytics', CURRENT_DATE + INTERVAL '7 days', false
WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Add Analytics & Progress Metrics');
