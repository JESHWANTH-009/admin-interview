import React, { useState } from "react";
import CreateTemplateModal from "../components/CreateTemplateModal";
import "./CreateInterview.css";

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
    passingScore: 70,
    description: "",
    role: "",
    experience: "",
    duration: "",
    questionSource: "ai",
    focusAreas: [],
    selectedTemplate: "",
  });
  const [showTemplateSection, setShowTemplateSection] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit form logic
    alert("Interview Created!\n" + JSON.stringify(form, null, 2));
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
          <div className="form-group">
            <label className="form-label">Passing Score (%) *</label>
            <input
              name="passingScore"
              type="number"
              min={0}
              max={100}
              value={form.passingScore}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>
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
            <label className="form-label">Duration *</label>
            <select
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select duration</option>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Brief description of this interview session..."
            rows={2}
          />
        </div>
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
        <div className="form-group">
          <label className="form-label">Focus Areas (Optional)</label>
          <div className="focus-tags">
            {FOCUS_AREAS.map((area) => (
              <span
                key={area}
                className={
                  "focus-tag" +
                  (form.focusAreas.includes(area) ? " selected" : "")
                }
                onClick={() => handleFocusToggle(area)}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
        {showTemplateSection && (
          <div className="template-section">
            <div className="template-header">
              <span>Select Question Template</span>
              <button
                type="button"
                className="primary"
                onClick={() => setTemplateModalOpen(true)}
              >
                + Create New Template
              </button>
            </div>
            {templates.length > 0 ? (
              <div className="template-select-group">
                <select
                  className="form-input"
                  value={form.selectedTemplate}
                  onChange={handleTemplateSelect}
                  required
                >
                  <option value="">Select a template</option>
                  {templates.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
                {selectedTemplateObj && (
                  <div className="template-preview">
                    <div className="template-preview-title">Questions in this template:</div>
                    <ol>
                      {selectedTemplateObj.questions.map((q, i) => (
                        <li key={i} style={{marginBottom: 4}}>{q.text}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <div className="template-empty">
                <div>No templates yet</div>
                <button type="button" className="outline" onClick={() => setTemplateModalOpen(true)}>
                  Create Template
                </button>
              </div>
            )}
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="outline" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Create Interview
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