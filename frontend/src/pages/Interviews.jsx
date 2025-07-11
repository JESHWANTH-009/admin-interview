import React, { useState } from "react";
import "./Interviews.css";

export default function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Mock data for interviews
  const interviews = [
    {
      id: 1,
      title: "Frontend Developer Assessment",
      role: "Frontend Developer",
      status: "active",
      candidates: 12,
      completed: 8,
      avgScore: 82,
      duration: "45 min",
      createdDate: "2024-01-15",
      lastActivity: "2 hours ago",
    },
    {
      id: 2,
      title: "Backend Engineer Interview",
      role: "Backend Developer",
      status: "completed",
      candidates: 8,
      completed: 8,
      avgScore: 85,
      duration: "60 min",
      createdDate: "2024-01-12",
      lastActivity: "1 day ago",
    },
    {
      id: 3,
      title: "DevOps Specialist Test",
      role: "DevOps Engineer",
      status: "draft",
      candidates: 0,
      completed: 0,
      avgScore: 0,
      duration: "30 min",
      createdDate: "2024-01-10",
      lastActivity: "3 days ago",
    },
    {
      id: 4,
      title: "Full Stack Developer Assessment",
      role: "Full Stack Developer",
      status: "active",
      candidates: 15,
      completed: 6,
      avgScore: 78,
      duration: "90 min",
      createdDate: "2024-01-08",
      lastActivity: "4 hours ago",
    },
    {
      id: 5,
      title: "UI/UX Designer Interview",
      role: "UI/UX Designer",
      status: "paused",
      candidates: 6,
      completed: 3,
      avgScore: 88,
      duration: "60 min",
      createdDate: "2024-01-05",
      lastActivity: "2 days ago",
    },
  ];

  const roles = ["all", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Full Stack Developer", "UI/UX Designer"];
  const statuses = ["all", "active", "completed", "draft", "paused"];

  // Filter interviews based on search and filters
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

      {/* Search and Filters */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Status" : getStatusText(status)}
              </option>
            ))}
          </select>
          
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

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Interviews Grid */}
      <div className="interviews-grid">
        {filteredInterviews.map((interview) => (
          <div key={interview.id} className="interview-card">
            <div className="card-header">
              <div className="interview-title">
                <h3>{interview.title}</h3>
                <span className={`status-badge ${getStatusBadgeClass(interview.status)}`}>
                  {getStatusText(interview.status)}
                </span>
              </div>
              <div className="card-actions">
                <button className="action-btn" title="Edit">
                  Edit
                </button>
                <button className="action-btn" title="Duplicate">
                  Duplicate
                </button>
                <button className="action-btn" title="More">
                  More
                </button>
              </div>
            </div>

            <div className="card-content">
              <div className="interview-role no-icon">
                {interview.role}
              </div>
              
              <div className="interview-stats">
                <div className="stat-item">
                  <span className="stat-label">Candidates</span>
                  <span className="stat-value">{interview.candidates}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{interview.completed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Score</span>
                  <span className="stat-value">{interview.avgScore}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">{interview.duration}</span>
                </div>
              </div>

              <div className="interview-meta">
                <span className="created-date">Created: {interview.createdDate}</span>
                <span className="last-activity">Last activity: {interview.lastActivity}</span>
              </div>
            </div>

            <div className="card-footer">
              <button className="outline">View Details</button>
              {getPrimaryAction(interview)}
            </div>
          </div>
        ))}
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