import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!interview) {
    return <div className="p-4">Loading interview details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{interview.title}</h1>
      <p className="text-gray-700 mb-2"><strong>Role:</strong> {interview.role}</p>
      <p className="text-gray-700 mb-2"><strong>Created At:</strong> {new Date(interview.created_at.seconds * 1000).toLocaleString()}</p>
      <p className="text-gray-700 mb-6"><strong>Question Type:</strong> {interview.question_type}</p>

      <h2 className="text-xl font-semibold mb-2 mt-6">Invited Candidates</h2>
      {interview.candidates && interview.candidates.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200 mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Link</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interview.candidates.map((candidate, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-sm">{candidate.email}</td>
                <td className="px-4 py-2 text-sm text-blue-600">
                  <a
                    href={candidate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {candidate.link}
                  </a>
                </td>
                <td className="px-4 py-2 text-sm capitalize">{candidate.status}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(candidate.link);
                      alert("Link copied to clipboard!");
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Copy Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No candidates invited yet.</p>
      )}
    </div>
  );
}
