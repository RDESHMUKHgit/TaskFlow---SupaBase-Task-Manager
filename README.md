# 🚀 TaskFlow — Full-Stack Tasks Manager

A lightweight, modern, full-stack Task Manager web application built with **React + Vite (JavaScript/JSX)**, **Express.js backend**, and **Supabase database**, styled with **pure, modern CSS**.

---

## 🏗️ Tech Stack

- **Frontend**: React (JSX), Vite, React Router DOM (`react-router-dom`), React Icons (`react-icons`), React Toastify (`react-toastify`), Axios, Pure Vanilla CSS (Glassmorphism & modern dark aesthetics).
- **Backend**: Node.js, Express.js REST API with CORS, Morgan, Dotenv, and centralized error handling with `if (error)` validations.
- **Database**: Supabase PostgreSQL with `@supabase/supabase-js`.

---

## 📁 Project Structure

```
tasks mini project/
├── client/                     # Frontend React + Vite app (JSX + Pure CSS)
│   ├── src/
│   │   ├── components/         # Modular UI components (with dedicated CSS)
│   │   │   ├── Navbar/         # Header with search & status badges
│   │   │   ├── Sidebar/        # Navigation & category filters
│   │   │   ├── StatsCard/      # Analytics summary KPI tiles
│   │   │   ├── TaskCard/       # Interactive task item card
│   │   │   ├── TaskList/       # Grid & table list view with skeleton loader
│   │   │   ├── TaskFilter/     # Status tabs, priority & sort controls
│   │   │   ├── TaskModal/      # Create & edit task modal dialog
│   │   │   ├── ConfirmModal/   # Delete confirmation prompt
│   │   │   └── SupabaseGuide/  # 1-click SQL copy & connection helper
│   │   ├── context/
│   │   │   └── TaskContext.jsx # Global state, filters, and CRUD operations
│   │   ├── pages/
│   │   │   ├── Dashboard/      # Main dashboard with progress & metrics
│   │   │   ├── AllTasks/       # Full task management with filters
│   │   │   ├── TaskDetails/    # Single task details view
│   │   │   ├── Analytics/      # Visual statistics & distribution
│   │   │   └── NotFound/       # 404 page
│   │   ├── services/
│   │   │   └── api.js          # Backend API client
│   │   ├── styles/
│   │   │   ├── variables.css   # Color palette & CSS variables
│   │   │   └── global.css      # Global styles & resets
│   │   ├── utils/
│   │   │   ├── supabase.js     # Supabase client helper
│   │   │   └── dateFormatter.js
│   │   ├── App.jsx             # Main App layout & routes
│   │   └── main.jsx
│   ├── .env                    # Client environment variables
│   └── package.json
│
├── server/                     # Backend Express.js REST API
│   ├── config/
│   │   └── supabase.js         # Supabase client setup
│   ├── controllers/
│   │   └── taskController.js   # CRUD controllers with `if (error)` handling
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized error & 404 middleware
│   ├── routes/
│   │   └── taskRoutes.js       # Express routes (/api/tasks)
│   ├── .env                    # Server environment variables
│   ├── package.json
│   └── server.js               # Express server entry point
│
├── supabase_schema.sql         # Idempotent Supabase SQL schema & seed script
├── package.json                # Root package.json with concurrent scripts
└── garbage/                    # Diagnostic scripts, schema inspection, logs
```

---

## ⚡ Quick Start

### 1. Run the Supabase SQL Schema
To create the `tasks` table and seed sample data in your Supabase project:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Paste the contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **RUN**.

*(Note: The SQL script uses `CREATE TABLE IF NOT EXISTS`, so it is completely safe to run multiple times without deleting existing data).*

---

### 2. Start Backend & Frontend Concurrently

From the root project directory, run:

```bash
npm run dev
```

This starts:
- **Express Backend API** on `http://localhost:5000`
- **React + Vite Frontend** on `http://localhost:5173`

Or run them individually:
- Backend: `npm run dev:server` (or `cd server && npm run dev`)
- Frontend: `npm run dev:client` (or `cd client && npm run dev`)

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | Get all tasks (supports query params `search`, `status`, `priority`, `category`, `sortBy`, `order`) |
| `GET` | `/api/tasks/stats` | Get task metrics and completion rate |
| `GET` | `/api/tasks/:id` | Get single task by ID |
| `POST` | `/api/tasks` | Create new task |
| `PUT` | `/api/tasks/:id` | Update task details |
| `PATCH`| `/api/tasks/:id/toggle` | Toggle task completion status |
| `DELETE`| `/api/tasks/:id` | Delete task |
