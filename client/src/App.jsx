import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import TaskModal from './components/TaskModal/TaskModal';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';
import ProfileModal from './components/ProfileModal/ProfileModal';

import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import AllTasks from './pages/AllTasks/AllTasks';
import TaskDetails from './pages/TaskDetails/TaskDetails';
import Analytics from './pages/Analytics/Analytics';
import NotFound from './pages/NotFound/NotFound';

import './App.css';

// Main authenticated app layout wrapper
function AuthenticatedLayout() {
  return (
    <TaskProvider>
      <div className="app-layout">
        {/* Top Sticky Navbar */}
        <Navbar />

        <div className="app-body">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="main-content">
            <div className="content-container">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Global Modals */}
        <TaskModal />
        <ConfirmModal />
        <ProfileModal />
      </div>
    </TaskProvider>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<AllTasks />} />
              <Route path="/tasks/:id" element={<TaskDetails />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Notification Container */}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
