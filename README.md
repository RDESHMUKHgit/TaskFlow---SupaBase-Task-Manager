# 🚀 TaskFlow — Full-Stack Tasks Manager (Supabase Auth & RLS)

A modern, full-stack Task Management web application built with **React + Vite (JSX)**, **Express.js backend**, and **Supabase Database & Authentication**, with **Row Level Security (RLS)**, persistent **1-hour JWT sessions with silent auto-refresh**, and styled with **pure Vanilla CSS**.

---

## 🏗️ Tech Stack

- **Frontend**: React 19 (JSX), Vite, React Router DOM, React Icons, React Toastify, Axios, Pure CSS (Dark Glassmorphic design).
- **Backend**: Node.js, Express.js REST API with CORS, Morgan, Dotenv, JWT Authentication middleware.
- **Database & Auth**: Supabase PostgreSQL with `@supabase/supabase-js`, Auth (`auth.users`), and Row Level Security (RLS).

---

## 🔐 Authentication & Session Management

- **Sign Up & Login**: Create an account with full name, email, and password. Newly created users are automatically mirrored into the `public.users` table via a PostgreSQL trigger (`on_auth_user_created`).
- **1-Hour Persistent Session & Silent Refresh**: Supabase Auth issues 1-hour JWT tokens with automatic background token refreshes using refresh tokens in `localStorage`. Users stay logged in across reloads until they explicitly sign out.
- **Row Level Security (RLS)**: Strict database-level security policies ensure authenticated users can **only view, create, update, and delete their own tasks**.
- **1-Click Demo Login**: Quick access button on the login screen for testing without manual form filling.

---

## 📁 Project Structure

```
tasks mini project/
├── client/                     # Frontend React + Vite app
│   ├── src/
│   │   ├── components/         # Modular UI components
│   │   │   ├── Navbar/         # Header with search, status pills & user dropdown
│   │   │   ├── Sidebar/        # Navigation, categories & user profile footer
│   │   │   ├── ProtectedRoute/ # Auth route guard with animated loader
│   │   │   ├── StatsCard/      # Analytics KPI cards
│   │   │   ├── TaskCard/       # Interactive task item card
│   │   │   ├── TaskList/       # Grid & table view with skeleton loader
│   │   │   ├── TaskFilter/     # Status tabs, priority & sort controls
│   │   │   ├── TaskModal/      # Create & edit task modal
│   │   │   ├── ConfirmModal/   # Delete confirmation prompt
│   │   │   └── SupabaseGuide/  # In-app SQL copy & RLS guide
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Auth state, user session & sign in/up/out
│   │   │   └── TaskContext.jsx # Task state, user-scoped queries & filters
│   │   ├── pages/
│   │   │   ├── Auth/           # Glassmorphic Login & Sign Up page
│   │   │   ├── Dashboard/      # Main dashboard with progress & metrics
│   │   │   ├── AllTasks/       # Full task management with filters
│   │   │   ├── TaskDetails/    # Single task details view
│   │   │   ├── Analytics/      # Visual statistics & distribution
│   │   │   └── NotFound/       # 404 page
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptor & auto-refresh
│   │   ├── styles/
│   │   │   ├── variables.css   # Color palette & CSS variables
│   │   │   └── global.css      # Global styles & resets
│   │   ├── utils/
│   │   │   ├── supabase.js     # Supabase client with auth persistence
│   │   │   └── dateFormatter.js
│   │   ├── App.jsx             # App layout & protected routes
│   │   └── main.jsx
│   ├── .env                    # Client environment variables
│   └── package.json
│
├── server/                     # Backend Express.js REST API
│   ├── config/
│   │   └── supabase.js         # Supabase client setup
│   ├── controllers/
│   │   └── taskController.js   # User-scoped CRUD controllers
│   ├── middleware/
│   │   ├── authMiddleware.js   # Supabase JWT token verification
│   │   └── errorHandler.js     # Centralized error & 404 middleware
│   ├── routes/
│   │   └── taskRoutes.js       # Protected task routes (/api/tasks)
│   ├── .env                    # Server environment variables
│   ├── package.json
│   └── server.js               # Express server entry point
│
├── supabase_schema.sql         # Supabase SQL schema with Auth & RLS policies
└── package.json                # Root package.json
```

---

## ⚡ Quick Start

### 1. Apply Supabase Database Schema & RLS Policies
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** (`/sql`).
3. Paste the contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **RUN**.

This will:
- Create `public.users` table linked to `auth.users(id)`.
- Set up automatic trigger `on_auth_user_created`.
- Add `user_id UUID NOT NULL REFERENCES auth.users(id)` on `public.tasks`.
- Enable **Row Level Security (RLS)** and apply strict user-isolation policies (`auth.uid() = user_id`).

---

### 2. Start Backend & Frontend Concurrently

From the root project directory, run:

```bash
npm run dev
```

This starts:
- **Express Backend API**: `http://localhost:5000`
- **React + Vite Frontend**: `http://localhost:5173`

---

## 🛡️ Row Level Security (RLS) Policies Summary

| Table | Action | Target Role | Policy Rule (`USING` / `WITH CHECK`) |
|---|---|---|---|
| `public.users` | `SELECT` | `authenticated` | `auth.uid() = id` |
| `public.users` | `UPDATE` | `authenticated` | `auth.uid() = id` |
| `public.users` | `INSERT` | `authenticated` | `auth.uid() = id` |
| `public.tasks` | `SELECT` | `authenticated` | `auth.uid() = user_id` |
| `public.tasks` | `INSERT` | `authenticated` | `auth.uid() = user_id` |
| `public.tasks` | `UPDATE` | `authenticated` | `auth.uid() = user_id` |
| `public.tasks` | `DELETE` | `authenticated` | `auth.uid() = user_id` |
