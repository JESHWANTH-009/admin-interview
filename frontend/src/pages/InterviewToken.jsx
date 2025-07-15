import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./InterviewToken.css"; // ✅ Importing your custom styles

export default function InterviewToken() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res1 = await axios.get(`/invite/interview/${token}`);
        const candidateData = res1.data;
        const res2 = await axios.get(`/interviews/public/${candidateData.interview_id}`);
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
      await axios.post(`/interview/submit`, { token, answers });
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit answers.");
      console.error(err);
    }
  };

  if (loading) return <div className="interview-token-page">Loading interview...</div>;

  const questionList = interview?.questions || [];

  if (questionList.length === 0) {
    return <div className="interview-token-page error">No questions found or invalid link.</div>;
  }

  if (submitted) {
    return (
      <div className="interview-token-page submitted">
        <h2>Thank you!</h2>
        <p>Your answers have been submitted successfully.</p>
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
        {/* <p className="question-text">{currentQuestion + 1}. {questionList[currentQuestion]}</p> */}
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
