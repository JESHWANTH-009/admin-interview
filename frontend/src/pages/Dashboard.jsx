import React, { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const [totalInterviews, setTotalInterviews] = useState('--');
  const [completionRate, setCompletionRate] = useState('--%');
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState('--');

  useEffect(() => {
    const fetchInterviewStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('firebase_id_token');
        const res = await fetch("http://localhost:8000/interviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const interviews = Array.isArray(data.interviews) ? data.interviews : [];
        setTotalInterviews(interviews.length);
        // Calculate completed sessions: candidates.length > 0 && candidates.length === responses.length
        const completedSessions = interviews.filter(i => {
          const candidates = Array.isArray(i.candidates) ? i.candidates : [];
          const responses = Array.isArray(i.responses) ? i.responses : [];
          return candidates.length > 0 && candidates.length === responses.length;
        }).length;
        // Calculate completion rate
        const rate = interviews.length > 0 ? Math.round((completedSessions / interviews.length) * 100) : 0;
        setCompletionRate(`${rate}%`);
        // Active Sessions logic
        const activeCount = interviews.filter(i => {
          const candidates = Array.isArray(i.candidates) ? i.candidates : [];
          if (candidates.length === 0) return false;
          const completedCandidates = candidates.filter(c => c.status === 'completed').length;
          return candidates.length !== completedCandidates;
        }).length;
        setActiveSessions(activeCount);
      } catch (err) {
        setTotalInterviews('--');
        setCompletionRate('--%');
        setActiveSessions('--');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewStats();
  }, []);

  // Mock data for dashboard
  const metrics = [
    { label: "Total Interviews", value: loading ? '--' : totalInterviews },
    { label: "Active Sessions", value: loading ? '--' : activeSessions },
    { label: "Completed Sessions", value: loading || totalInterviews === '--' || activeSessions === '--' ? '--' : (totalInterviews - activeSessions) },
  ];

  const recentInterviews = [
    {
      id: 1,
      title: "Frontend Developer Assessment",
      role: "Frontend Developer",
      status: "Active",
      candidates: 12,
      completed: 8,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Backend Engineer Interview",
      role: "Backend Developer",
      status: "Completed",
      candidates: 8,
      completed: 8,
      date: "2024-01-12",
    },
    {
      id: 3,
      title: "DevOps Specialist Test",
      role: "DevOps Engineer",
      status: "Draft",
      candidates: 0,
      completed: 0,
      date: "2024-01-10",
    },
  ];

  const recentActivity = [
    {
      type: "interview_created",
      message: "Frontend Developer Assessment created",
      time: "2 hours ago",
    },
    {
      type: "candidate_completed",
      message: "Alice Johnson completed Backend Engineer Interview",
      time: "4 hours ago",
    },
    {
      type: "invite_sent",
      message: "Invites sent to 5 candidates for DevOps Specialist Test",
      time: "6 hours ago",
    },
    {
      type: "interview_completed",
      message: "Backend Engineer Interview completed with 85% avg score",
      time: "1 day ago",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your interviews.</p>
        </div>
        <button
          className="dashboard-logout-btn enhanced"
          onClick={onLogout}
          style={{ position: 'absolute', right: 0, top: 0, margin: '1.5rem 2rem 0 0', padding: '0.6rem 2rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '999px', background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.10)', letterSpacing: '0.03em', transition: 'background 0.2s, box-shadow 0.2s', zIndex: 2 }}
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)'}
        >
          <span style={{ marginRight: 8, fontWeight: 700 }}>⎋</span> Logout
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className="metric-value">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Interviews */}
        <div className="content-section">
          <div className="section-header">
            <h2>Recent Interviews</h2>
            <button className="primary">View All</button>
          </div>
          <div className="interviews-list">
            {recentInterviews.map((interview) => (
              <div key={interview.id} className="interview-card">
                <div className="interview-info">
                  <h3>{interview.title}</h3>
                  <p className="interview-role">{interview.role}</p>
                  <div className="interview-stats">
                    <span>{interview.candidates} candidates</span>
                    <span>{interview.completed} completed</span>
                  </div>
                </div>
                <div className="interview-status">
                  <span className={`status-badge ${interview.status.toLowerCase()}`}>
                    {interview.status}
                  </span>
                  <span className="interview-date">{interview.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="content-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-feed">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === "interview_created" && "📝"}
                  {activity.type === "candidate_completed" && "✅"}
                  {activity.type === "invite_sent" && "📧"}
                  {activity.type === "interview_completed" && "🏆"}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 