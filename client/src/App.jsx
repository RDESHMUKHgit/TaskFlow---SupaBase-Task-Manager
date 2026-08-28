import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import TaskModal from './components/TaskModal/TaskModal';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';

import Dashboard from './pages/Dashboard/Dashboard';
import AllTasks from './pages/AllTasks/AllTasks';
import TaskDetails from './pages/TaskDetails/TaskDetails';
import Analytics from './pages/Analytics/Analytics';
import NotFound from './pages/NotFound/NotFound';

import './App.css';

export default function App() {
  return (
    <Router>
      <TaskProvider>
        <div className="app-layout">
          {/* Top Sticky Navbar */}
          <Navbar />

          <div className="app-body">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Application Content Area */}
            <main className="main-content">
              <div className="content-container">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tasks" element={<AllTasks />} />
                  <Route path="/tasks/:id" element={<TaskDetails />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* Global Modals */}
          <TaskModal />
          <ConfirmModal />

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
            theme="dark"
          />
        </div>
      </TaskProvider>
    </Router>
  );
}
