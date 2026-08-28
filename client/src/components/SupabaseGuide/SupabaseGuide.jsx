import React, { useState } from 'react';
import { FiDatabase, FiCopy, FiCheck, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTaskContext } from '../../context/TaskContext';
import './SupabaseGuide.css';

const SCHEMA_SQL = `-- Create tasks table in Supabase
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

-- Enable RLS & Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.tasks FOR DELETE USING (true);

-- Insert initial sample tasks
INSERT INTO public.tasks (title, description, status, priority, category, due_date, is_completed)
VALUES 
  ('Setup Supabase & Express Backend', 'Configure database connection and create CRUD REST API routes.', 'completed', 'high', 'Development', CURRENT_DATE, true),
  ('Design Responsive Task Manager UI', 'Implement modern glassmorphic components using pure CSS.', 'in_progress', 'urgent', 'Design', CURRENT_DATE + INTERVAL '2 days', false),
  ('Implement Task Filtering & Search', 'Add search by title, filter by category and status.', 'pending', 'medium', 'Feature', CURRENT_DATE + INTERVAL '5 days', false);`;

export default function SupabaseGuide() {
  const { isDbReady, fetchTasks } = useTaskContext();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  if (isDbReady) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    toast.success('SQL schema copied to clipboard! 📋');
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
            <h3 className="guide-title">Supabase Database Setup Required</h3>
            <p className="guide-subtitle">
              The <code>tasks</code> table was not found in your Supabase project schema. Run the SQL snippet below in your Supabase SQL Editor.
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
