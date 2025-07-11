import React from "react";
import "./Dashboard.css";

export default function Dashboard() {
  // Mock data for dashboard
  const metrics = [
    { label: "Total Interviews", value: "24", change: "+12%", trend: "up" },
    { label: "Active Sessions", value: "8", change: "+3", trend: "up" },
    { label: "Avg Completion Rate", value: "78%", change: "+5%", trend: "up" },
    { label: "Avg Score", value: "82%", change: "-2%", trend: "down" },
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
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your interviews.</p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
              <span className={`metric-change ${metric.trend}`}>
                {metric.change}
              </span>
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