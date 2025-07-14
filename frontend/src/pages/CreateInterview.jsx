import React, { useState } from "react";
import CreateTemplateModal from "../components/CreateTemplateModal";
import "./CreateInterview.css";
import axios from "axios";
import UploadPDFModal from '../components/UploadPDFModal';

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Full Stack Developer",
  "UI/UX Designer",
];
const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];
const DURATIONS = ["30 min", "45 min", "60 min", "90 min"];
const FOCUS_AREAS = [
  "Data Structures & Algorithms",
  "System Design",
  "JavaScript/TypeScript",
  "React/Frontend",
  "Node.js/Backend",
  "Database Design",
  "API Design",
  "Problem Solving",
  "Code Review",
  "Architecture Patterns",
];

export default function CreateInterview() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    experience: "",
    numQuestions: 5,
    questionSource: "ai",
    focusAreas: [],
    selectedTemplate: "",
  });
  const [showTemplateSection, setShowTemplateSection] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [emails, setEmails] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'numQuestions' ? Number(value) : value }));
  };

  const handleFocusToggle = (area) => {
    setForm((f) => ({
      ...f,
      focusAreas: f.focusAreas.includes(area)
        ? f.focusAreas.filter((a) => a !== area)
        : [...f.focusAreas, area],
    }));
  };

  const handleQuestionSource = (e) => {
    setForm((f) => ({ ...f, questionSource: e.target.value, selectedTemplate: "" }));
    setShowTemplateSection(e.target.value === "template");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInviteStatus("");
    // TODO: Submit interview creation logic (AI or template)
    // For demo, assume interview is created and we have interviewId
    const interviewId = "demo-interview-id"; // Replace with real ID from backend
    const emailList = emails.split(/[\s,;]+/).filter(Boolean);
    try {
      await axios.post("/interviews/send-invites", {
        interview_id: interviewId,
        emails: emailList,
      });
      setInviteStatus("Invitations sent successfully!");
    } catch (err) {
      setInviteStatus("Failed to send invitations.");
    }
  };

  const handleTemplateSave = (template) => {
    setTemplates((prev) => [...prev, template]);
    setTemplateModalOpen(false);
    setForm((f) => ({ ...f, selectedTemplate: template.name }));
  };

  const handleTemplateSelect = (e) => {
    setForm((f) => ({ ...f, selectedTemplate: e.target.value }));
  };

  const selectedTemplateObj = templates.find(t => t.name === form.selectedTemplate);

  return (
    <div className="create-interview-page">
      <form className="create-interview-form" onSubmit={handleSubmit}>
        <h1 className="form-title">Create New Interview Session</h1>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Interview Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Frontend Developer Assessment"
              required
            />
          </div>
        </div>
        {/* Move Question Source here */}
        <div className="form-group">
          <label className="form-label">Question Source *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="questionSource"
                value="ai"
                checked={form.questionSource === "ai"}
                onChange={handleQuestionSource}
              />
              AI Generated
            </label>
            <label>
              <input
                type="radio"
                name="questionSource"
                value="template"
                checked={form.questionSource === "template"}
                onChange={handleQuestionSource}
              />
              Custom Template
            </label>
          </div>
        </div>
        {/* Conditionally render Role, Experience Level, Number of Questions only for AI Generated */}
        {form.questionSource === "ai" && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select a role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience Level *</label>
              <select
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Number of Questions *</label>
              <input
                name="numQuestions"
                type="number"
                min={1}
                max={50}
                value={form.numQuestions}
                onChange={handleChange}
                className="form-input"
                required
                style={{ width: 120 }}
              />
            </div>
          </div>
        )}
        {/* Show Upload PDF option for Custom Template */}
        {form.questionSource === "template" && (
          <div className="form-group">
            <button
              type="button"
              className="primary"
              style={{ marginBottom: 16 }}
              onClick={() => setShowUploadModal(true)}
            >
              Upload PDF
            </button>
            <UploadPDFModal open={showUploadModal} onClose={() => setShowUploadModal(false)} />
          </div>
        )}
        {/* Remove Description and Focus Areas, add Emails to Send */}
        {/* <div className="form-group">
          <label className="form-label">Description</label>
          <textarea ... />
        </div> */}
        {/* <div className="form-group">
          <label className="form-label">Focus Areas (Optional)</label>
          ...
        </div> */}
        <div className="form-group">
          <label className="form-label">Emails to Send *</label>
          <textarea
            name="emails"
            value={emails}
            onChange={e => setEmails(e.target.value)}
            className="form-input"
            placeholder="Enter candidate emails, separated by commas or new lines"
            rows={3}
            required
          />
        </div>
        {inviteStatus && (
          <div style={{ color: inviteStatus.includes("success") ? "green" : "red", marginBottom: 12 }}>{inviteStatus}</div>
        )}
        <div className="form-actions">
          <button type="button" className="outline" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Send Invites
          </button>
        </div>
      </form>
      <CreateTemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSave={handleTemplateSave}
      />
    </div>
  );
} 