import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./InterviewToken.css";

const API_URL = process.env.REACT_APP_API_URL;
export default function InterviewToken() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

 

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res1 = await axios.get(`${API_URL}/invite/interview/${token}`);
        const candidateData = res1.data;

        const res2 = await axios.get(`${API_URL}/interviews/public/${candidateData.interview_id}`);
        setInterview(res2.data);
        setAnswers(new Array(res2.data?.questions?.length || 0).fill(""));
      } catch (err) {
        alert("Invalid or expired interview link.");
        console.error("AxiosError", err);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [token]);

  const handleAnswerChange = (e) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = e.target.value;
    setAnswers(updatedAnswers);
  };

  const nextQuestion = () => setCurrentQuestion((prev) => prev + 1);
  const prevQuestion = () => setCurrentQuestion((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${API_URL}/interviews/submit`, {
        token,
        answers
      });
      setEvaluation(res.data);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit answers.");
      console.error("Submission failed:", err);
    }
  };

  const questionList = interview?.questions || [];

  if (loading) return <div className="interview-token-page">Loading interview...</div>;

  if (questionList.length === 0) {
    return <div className="interview-token-page error">No questions found or invalid link.</div>;
  }

  if (submitted && evaluation) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#f8fafc', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 style={{ textAlign: 'center', color: '#16a34a', fontWeight: 800, marginBottom: 8 }}>Thank you!</h2>
        <p style={{ textAlign: 'center', color: '#334155', fontSize: 18, marginBottom: 32 }}>Your answers have been submitted successfully.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {evaluation.evaluations?.map((result, idx) => (
            <div key={idx} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}><span style={{ color: '#2563eb' }}>Q{idx + 1}:</span> {result.question}</div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#64748b', marginRight: 8 }}>Your Answer:</span>
                <span style={{ color: '#334155' }}>{result.answer || <span style={{ color: '#9ca3af' }}>(No answer provided)</span>}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#64748b', marginRight: 8 }}>Score:</span>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 16px',
                  borderRadius: 16,
                  background: result.score > 0 ? '#dcfce7' : '#fee2e2',
                  color: result.score > 0 ? '#166534' : '#dc2626',
                  fontWeight: 700,
                  fontSize: 15
                }}>{result.score}</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 8, padding: 14, color: '#334155', fontSize: 15, fontStyle: 'italic' }}>
                <span style={{ fontWeight: 600, color: '#2563eb', marginRight: 8 }}>Feedback:</span>
                {result.feedback || <span style={{ color: '#9ca3af' }}>(No feedback provided)</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'right', marginTop: 36, fontWeight: 800, fontSize: 20, color: '#1e293b' }}>
          Total Score: {evaluation.total_score} / {questionList.length}
        </div>
      </div>
    );
  }

  return (
    <div className="interview-token-container">
      <h1 className="interview-title">{interview?.title}</h1>
      <p className="question-progress">
        Question {currentQuestion + 1} of {questionList.length}
      </p>

      <div className="question-box">
        <p className="question-text">{questionList[currentQuestion]}</p>
      </div>

      <textarea
        className="answer-box"
        placeholder="Type your answer here..."
        value={answers[currentQuestion]}
        onChange={handleAnswerChange}
        required
      />

      <div className="button-group">
        <button
          disabled={currentQuestion === 0}
          onClick={prevQuestion}
          className="nav-btn"
        >
          Previous
        </button>

        {currentQuestion < questionList.length - 1 ? (
          <button onClick={nextQuestion} className="nav-btn primary-btn">Next</button>
        ) : (
          <button onClick={handleSubmit} className="nav-btn submit-btn">Submit</button>
        )}
      </div>
    </div>
  );
}