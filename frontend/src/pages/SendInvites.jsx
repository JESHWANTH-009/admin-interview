import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function SendInvites() {
  const { interviewId } = useParams();
  const [emails, setEmails] = useState(['']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (idx, value) => {
    setEmails(emails.map((e, i) => (i === idx ? value : e)));
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (idx) => {
    setEmails(emails.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('firebase_id_token');
      const res = await axios.post('/invite/send', {
        interview_id: interviewId,
        emails: emails.filter(email => email.trim() !== ''),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setResult({
        success: res.data.success,
        failed: res.data.failed || []
      });
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send invites.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch {
      alert('Failed to copy link.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Send Invites</h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <label className="block font-semibold mb-2">Candidate Emails</label>
        {emails.map((email, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="email"
              className="form-input flex-1 mr-2"
              value={email}
              onChange={e => handleEmailChange(idx, e.target.value)}
              placeholder="Enter Gmail address"
              required
            />
            {emails.length > 1 && (
              <button type="button" className="text-red-500 px-2" onClick={() => handleRemoveEmail(idx)}>-</button>
            )}
            {idx === emails.length - 1 && (
              <button type="button" className="text-green-600 px-2" onClick={handleAddEmail}>+</button>
            )}
          </div>
        ))}
        <button type="submit" className="primary mt-4" disabled={loading}>
          {loading ? 'Sending...' : 'Send Invites'}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      {result && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-green-700">Success</h3>
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.success.map(({ email, link }, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="underline">{link}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                      onClick={() => handleCopy(link)}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.failed.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-700">Failed</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.failed.map(({ email, reason }, idx) => (
                    <tr key={idx} className="hover:bg-red-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
