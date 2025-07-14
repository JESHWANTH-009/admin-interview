import React, { useState } from 'react';
import axios from 'axios';
import './CreateTemplateModal.css'; // Reuse modal styles

export default function UploadPDFModal({ open, onClose, onExtracted }) {
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('Text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTypeChange = (e) => {
    setQuestionType(e.target.value);
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    setError('');
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
      if (onExtracted) onExtracted(res.data.questions || [], questionType);
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload PDF.');
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
      </div>
    </div>
  );
} 