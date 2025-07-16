import React, { useState, useEffect } from "react";
import "./Interviews.css";

export default function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem('firebase_id_token');
        const response = await fetch("http://localhost:8000/interviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch interviews");
        const data = await response.json();
        // Sort interviews by created_at (or createdAt/createdDate) descending
        const sorted = (data.interviews || []).slice().sort((a, b) => {
          // Try all possible field names
          const aTime = new Date(a.created_at || a.createdAt || a.createdDate || 0).getTime();
          const bTime = new Date(b.created_at || b.createdAt || b.createdDate || 0).getTime();
          return bTime - aTime;
        });
        setInterviews(sorted);
      } catch (err) {
        // handle error
      }
    };
    fetchInterviews();
  }, []);

  const roles = ["all", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Full Stack Developer", "UI/UX Designer"];
  const statuses = ["all", "active", "completed", "draft", "paused"];

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    const matchesRole = roleFilter === "all" || interview.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active": return "badge-success";
      case "completed": return "badge-info";
      case "draft": return "badge-warning";
      case "paused": return "badge-error";
      default: return "badge-warning";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Active";
      case "completed": return "Completed";
      case "draft": return "Draft";
      case "paused": return "Paused";
      default: return status;
    }
  };

  const getPrimaryAction = (interview) => {
    if (interview.status === "active") {
      return <button className="primary">Send Invites</button>;
    } else if (interview.status === "draft") {
      return <button className="primary">Activate</button>;
    } else if (interview.status === "paused") {
      return <button className="primary">Resume</button>;
    } else if (interview.status === "completed") {
      return <button className="primary">Export Results</button>;
    }
    return null;
  };

  return (
    <div className="interviews-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Interviews</h1>
          <p className="page-subtitle">Manage and track all your interview sessions</p>
        </div>
        <button className="primary create-btn">
          + Create Interview
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "all" ? "All Roles" : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-summary">
        <span className="results-count">
          {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="interviews-grid">
        {filteredInterviews.map((interview) => {
          const completedCount = Array.isArray(interview.candidates)
            ? interview.candidates.filter(c => c.status === "completed").length
            : 0;
          const createdDate = interview.created_at
            ? new Date(interview.created_at).toLocaleDateString()
            : "-";
          return (
            <div key={interview.id} className="interview-card">
              <div className="card-header">
                <div className="interview-title">
                  <h3>{interview.title}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(interview.status)}`}>
                    {getStatusText(interview.status)}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <div className="interview-role no-icon">
                  {interview.role}
                </div>

                <div className="interview-stats">
                  <div className="stat-item">
                    <span className="stat-label">Candidates</span>
                    <span className="stat-value">{Array.isArray(interview.candidates) ? interview.candidates.length : 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">COMPLETED</span>
                    <span className="stat-value">{completedCount}</span>
                  </div>
                </div>

                <div className="interview-meta">
                  <span className="created-date">
                    Created: <span style={{ color: '#9ca3af', fontWeight: 500 }}>{createdDate}</span>
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="outline"
                  onClick={() => window.location.href = `/interview/${interview.id}/details`}
                >
                  View Details
                </button>

                {getPrimaryAction(interview)}
              </div>
            </div>
          );
        })}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">No Data</div>
          <h3>No interviews found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button className="primary">Create Your First Interview</button>
        </div>
      )}
    </div>
  );
}
