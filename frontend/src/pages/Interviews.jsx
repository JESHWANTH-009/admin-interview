import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Interviews.css";

export default function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

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

  const roles = ["Frontend Developer", "Backend Developer", "DevOps Engineer", "Full Stack Developer", "UI/UX Designer"];
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
      <div className="interviews-header-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="role-filter"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div className="interviews-grid">
        {filteredInterviews.map((interview) => {
          const completedCount = Array.isArray(interview.candidates)
            ? interview.candidates.filter(c => c.status === "completed").length
            : 0;
          const createdDate = interview.created_at
            ? new Date(interview.created_at).toLocaleDateString()
            : "-";
          const isCompleted = Array.isArray(interview.candidates) && interview.candidates.length > 0 && completedCount === interview.candidates.length;
          return (
            <div key={interview.id} className="interview-card">
              <div className="interview-card-header">
                <h3 className="interview-title">{interview.title}</h3>
                <span className={`status-badge ${isCompleted ? 'completed' : 'active'}`}>{isCompleted ? 'Completed' : 'Active'}</span>
              </div>
              <div className="interview-role">{interview.role}</div>
              <div className="interview-meta">
                <div><strong>{Array.isArray(interview.candidates) ? interview.candidates.length : 0}</strong> candidates</div>
                <div className="meta-divider" />
                <div><strong>{completedCount}</strong> completed</div>
                <div className="meta-divider" />
                <div>Created: {createdDate}</div>
              </div>
              <button className="view-details-btn" onClick={() => navigate(`/interviews/${interview.id}`)}>View Details</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
