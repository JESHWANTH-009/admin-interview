import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function InterviewToken() {
  const { token } = useParams();
  const [interview, setInterview] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answerInput, setAnswerInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const candidateRes = await axios.get(`/invite/interview/${token}`);
        setCandidate(candidateRes.data);
        const interviewRes = await axios.get(`/interviews/${candidateRes.data.interview_id}`);
        setInterview(interviewRes.data);
        setAnswers(new Array(interviewRes.data.questions.length).fill(''));
      } catch (err) {
        console.error("Invalid token or interview not found.");
      }
    }
    fetchInterview();
  }, [token]);

  const handleNext = () => {
    const updated = [...answers];
    updated[currentIndex] = answerInput;
    setAnswers(updated);
    setAnswerInput(updated[currentIndex + 1] || '');
    setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = async () => {
    const updated = [...answers];
    updated[currentIndex] = answerInput;
    try {
      await axios.post(`/invite/submit/${token}`, updated);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit answers');
    }
  };

  if (!interview || !candidate) return <div className="p-6">Loading interview...</div>;
  if (submitted) return <div className="p-6 text-green-600">Your interview has been submitted. Thank you!</div>;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-6 text-center">{interview.title}</h2>
      <div className="mb-4">
        <div className="text-gray-700 mb-2">
          <strong>Question {currentIndex + 1} of {interview.questions.length}</strong>
        </div>
        <div className="text-lg font-medium mb-3">{interview.questions[currentIndex]}</div>
        <textarea
          value={answerInput}
          onChange={e => setAnswerInput(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={4}
        />
      </div>
      <div className="flex justify-end">
        {currentIndex < interview.questions.length - 1 ? (
          <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
        ) : (
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
        )}
      </div>
    </div>
  );
}
