import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Interviews from "./pages/Interviews";
import CreateInterview from "./pages/CreateInterview";
import InterviewDetail from "./pages/InterviewDetail";
import SendInvites from "./pages/SendInvites";
import Settings from "./pages/Settings";
import InterviewToken from "./pages/InterviewToken";
import Signup from './components/Signup';
import Login from './components/Login';

import "./App.css";

function RequireAuth({ children }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('firebase_id_token');
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppLayout({ onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard onLogout={onLogout} />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/create" element={<CreateInterview />} />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/send-invites/:interviewId" element={<SendInvites />} />
          <Route path="/interview/:token" element={<InterviewToken />} />
          <Route path="/settings" element={<Settings />} />
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<div className="p-6 text-center text-red-600">404 - Page Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('firebase_id_token'));

  useEffect(() => {
    const handler = () => setIsAuthenticated(!!localStorage.getItem('firebase_id_token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('firebase_id_token');
    setIsAuthenticated(false);
    window.location.replace('/login');
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={(_uid, _email, token) => {
                localStorage.setItem('firebase_id_token', token);
                setIsAuthenticated(true);
                window.location.replace('/dashboard');
              }}
              onToggleView={() => window.location.replace('/signup')}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              onSignupSuccess={() => {
                window.location.replace('/login');
              }}
              onToggleView={() => window.location.replace('/login')}
            />
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* All protected routes nested in AppLayout */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppLayout onLogout={handleLogout} />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
