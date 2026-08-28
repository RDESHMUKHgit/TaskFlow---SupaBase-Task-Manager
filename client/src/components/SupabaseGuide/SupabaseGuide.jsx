import React, { useState } from 'react';
import { FiDatabase, FiCopy, FiCheck, FiRefreshCw, FiExternalLink, FiHardDrive } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTaskContext } from '../../context/TaskContext';
import './SupabaseGuide.css';

const SCHEMA_SQL = `-- 1. Create public.users table linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sync auth.users -> public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
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
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create tasks table with user_id Foreign Key and Attachment fields
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

-- 4. Enable RLS and Strict Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Create Storage Bucket for Task Attachments (Photos & PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-attachments',
    'task-attachments',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Authenticated users can upload task attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload task attachments"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'task-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can view task attachments" ON storage.objects;
CREATE POLICY "Anyone can view task attachments"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'task-attachments');

DROP POLICY IF EXISTS "Users can delete own task attachments" ON storage.objects;
CREATE POLICY "Users can delete own task attachments"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'task-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);`;

export default function SupabaseGuide() {
  const { isDbReady, fetchTasks } = useTaskContext();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  if (isDbReady) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    toast.success('Complete SQL Schema & Storage policies copied! 📋');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    await fetchTasks();
    setChecking(false);
  };

  return (
    <div className="supabase-guide-banner glass-card animate-fade-in">
      <div className="guide-header">
        <div className="guide-title-box">
          <div className="guide-icon">
            <FiDatabase />
          </div>
          <div>
            <h3 className="guide-title">Supabase Database & Storage Setup</h3>
            <p className="guide-subtitle">
              Configure your <code>tasks</code> table, RLS policies, and <code>task-attachments</code> storage bucket by running the SQL snippet below in your Supabase SQL Editor.
            </p>
          </div>
        </div>

        <div className="guide-actions">
          <button className="btn btn-secondary" onClick={handleCopySql}>
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
            <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
          </button>
          <button className="btn btn-primary" onClick={handleCheckAgain} disabled={checking}>
            <FiRefreshCw size={16} className={checking ? 'spin' : ''} />
            <span>{checking ? 'Checking...' : 'Check Connection'}</span>
          </button>
          <a
            href="https://supabase.com/dashboard/project/yzpxutumszxlgxpdajyg/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary external-link-btn"
          >
            <FiExternalLink size={16} />
            <span>Open Supabase SQL Editor</span>
          </a>
        </div>
      </div>

      <div className="sql-preview-box">
        <pre>
          <code>{SCHEMA_SQL}</code>
        </pre>
      </div>
    </div>
  );
}
