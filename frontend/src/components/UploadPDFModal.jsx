import React, { useState } from 'react';
import axios from 'axios';
import './CreateTemplateModal.css'; // Reuse modal styles

export default function UploadPDFModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('Text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editableQuestions, setEditableQuestions] = useState([]);
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTypeChange = (e) => {
    setQuestionType(e.target.value);
  };

  const handleExtract = async (e) => {
    e.preventDefault(); // Prevent form from submitting and navigating
    setError('');
    setQuestions([]);
    setEditableQuestions([]);
    setSuccessMsg('');
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question_type', questionType);
      const token = localStorage.getItem('firebase_id_token');
      const res = await axios.post('/upload/pdf', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      setQuestions(res.data.questions || []);
      setEditableQuestions(res.data.questions || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionEdit = (idx, value) => {
    setEditableQuestions((prev) => prev.map((q, i) => (i === idx ? value : q)));
  };

  const handleSendInvites = async () => {
    setError('');
    setSuccessMsg('');
    if (!title || !role || editableQuestions.length === 0 || !emails.trim()) {
      setError('Please fill in all fields and extract questions.');
      return;
    }
    setLoading(true);
    try {
      // 1. Create interview
      const createRes = await axios.post('/interviews/create', {
        title,
        role,
        question_type: questionType,
        questions: editableQuestions,
      });
      const interview_id = createRes.data.interview_id;
      // 2. Send invites
      const emailList = emails.split(/[\s,;]+/).filter(Boolean);
      await axios.post('/interviews/send-invites', {
        interview_id,
        emails: emailList,
      });
      setSuccessMsg('Invites sent successfully.');
      setEditableQuestions([]);
      setEmails('');
      setFile(null);
      setTitle('');
      setRole('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send invites.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="template-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 className="modal-title">Upload PDF</h2>
        <div className="modal-group">
          <label className="modal-label">Interview Title *</label>
          <input
            className="modal-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer Assessment"
            required
          />
        </div>
        <div className="modal-group">
          <label className="modal-label">Role *</label>
          <input
            className="modal-input"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>
        <div className="modal-group">
          <label className="modal-label">Select PDF File *</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          {file && <div className="imported-file">{file.name}</div>}
        </div>
        <div className="modal-group">
          <label className="modal-label">Question Type *</label>
          <select className="modal-input" value={questionType} onChange={handleTypeChange}>
            <option value="Text">Text</option>
            <option value="MCQ">MCQ</option>
          </select>
        </div>
        {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="modal-actions">
          <button type="button" className="outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={handleExtract} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Extract'}
          </button>
        </div>
        {/* Editable questions */}
        {editableQuestions.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 20, border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Extracted Questions (Editable)</h3>
            <ol>
              {editableQuestions.map((q, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <input
                    className="modal-input"
                    value={q}
                    onChange={e => handleQuestionEdit(i, e.target.value)}
                    style={{ width: '90%' }}
                  />
                </li>
              ))}
            </ol>
          </div>
        )}
        {/* Emails input and send invites */}
        {editableQuestions.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <label className="modal-label">Candidate Emails *</label>
            <textarea
              className="form-input"
              value={emails}
              onChange={e => setEmails(e.target.value)}
              placeholder="Enter candidate emails, separated by commas or new lines"
              rows={3}
              required
            />
            <button
              type="button"
              className="primary"
              style={{ marginTop: 16 }}
              onClick={handleSendInvites}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Invites'}
            </button>
          </div>
        )}
        {successMsg && (
          <div style={{ color: 'green', marginTop: 16, fontWeight: 500 }}>{successMsg}</div>
        )}
      </div>
    </div>
  );
} 