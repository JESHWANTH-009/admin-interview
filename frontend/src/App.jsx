import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Interviews from "./pages/Interviews";
import CreateInterview from "./pages/CreateInterview";
import InterviewDetail from "./pages/InterviewDetail";
import SendInvites from "./pages/SendInvites";
import Settings from "./pages/Settings";
import InterviewToken from "./pages/InterviewToken";
import "./App.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/create" element={<CreateInterview />} />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/send-invites/:interviewId" element={<SendInvites />} />
          <Route path="/interview/:token" element={<InterviewToken />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
} 