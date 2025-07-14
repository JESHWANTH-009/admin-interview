import React, { useState } from "react";
import CreateTemplateModal from "../components/CreateTemplateModal";
import UploadPDFModal from "../components/UploadPDFModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateInterview.css";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Full Stack Developer",
  "UI/UX Designer",
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [editableQuestions, setEditableQuestions] = useState([]);
  const [questionType, setQuestionType] = useState("Text");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "numQuestions" ? Number(value) : value,
    }));
  };

  const handleFocusToggle = (area) => {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleQuestionSource = (e) => {
    setForm((prev) => ({
      ...prev,
      questionSource: e.target.value,
      selectedTemplate: "",
    }));
    setShowTemplateSection(e.target.value === "template");
  };

  const handleExtracted = (questions, type) => {
    setExtractedQuestions(questions);
    setEditableQuestions(questions);
    setQuestionType(type);
  };

  const handleQuestionEdit = (index, value) => {
    setEditableQuestions((prev) =>
      prev.map((q, i) => (i === index ? value : q))
    );
  };

  const handleTemplateSave = (template) => {
    setTemplates((prev) => [...prev, template]);
    setTemplateModalOpen(false);
    setForm((prev) => ({ ...prev, selectedTemplate: template.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("firebase_id_token");
      const response = await axios.post(
        "/interviews/create",
        {
          title: form.title,
          role: form.role,
          question_type: form.questionSource === "ai" ? "AI" : questionType,
          questions: form.questionSource === "ai" ? [] : editableQuestions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const interview_id = response.data.interview_id;
      navigate(`/send-invites/${interview_id}`); // ✅ Corrected path
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to create interview.");
    }
  };

  return (
    <div className="create-interview-page">
      <form className="create-interview-form" onSubmit={handleSubmit}>
        <h1 className="form-title">Create New Interview Session</h1>

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
              />
            </div>
          </div>
        )}

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
            <UploadPDFModal
              open={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onExtracted={handleExtracted}
            />
          </div>
        )}

        {form.questionSource === "template" &&
          extractedQuestions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  Extracted Questions (Editable)
                </h3>
                <ol>
                  {editableQuestions.map((q, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <input
                        className="form-input"
                        value={q}
                        onChange={(e) =>
                          handleQuestionEdit(i, e.target.value)
                        }
                        style={{ width: "90%" }}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

        <div className="form-actions">
          <button
            type="button"
            className="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button type="submit" className="primary">
            Next
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
