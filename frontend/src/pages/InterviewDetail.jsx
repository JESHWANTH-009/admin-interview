import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./InterviewDetails.css";

export default function InterviewDetail() {
  const { id } = useParams(); // interview ID from URL
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = localStorage.getItem("firebase_id_token");
        const res = await axios.get(`/interviews/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInterview(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load interview details.");
      }
    };

    fetchInterview();
  }, [id]);

  if (error) {
    return <div className="details-container"><div className="error-message">{error}</div></div>;
  }

  if (!interview) {
    return <div className="details-container"><div className="loading-message">Loading interview details...</div></div>;
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <h1 className="details-title">{interview.title}</h1>
        <div className="details-meta-row">
          <span className="details-role"><strong>Role:</strong> {interview.role}</span>
          <span className="details-type"><strong>Question Type:</strong> {interview.question_type}</span>
        </div>
        <hr className="details-divider" />
        <h2 className="details-subtitle">Invited Candidates</h2>
        {interview.candidates && interview.candidates.length > 0 ? (
          <table className="details-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Link</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {interview.candidates.map((candidate, idx) => (
                <tr key={idx}>
                  <td>{candidate.email}</td>
                  <td>
                    <a
                      href={candidate.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {candidate.link}
                    </a>
                  </td>
                  <td>
                    <span className={`status-badge status-${candidate.status}`}>{candidate.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(candidate.link);
                        alert("Link copied to clipboard!");
                      }}
                      className="copy-link-btn"
                    >
                      Copy Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-candidates">No candidates invited yet.</p>
        )}
      </div>
    </div>
  );
}
