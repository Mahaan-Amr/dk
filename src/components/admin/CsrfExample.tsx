'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

// Define a type for API responses
interface ApiResponse {
  message: string;
  data?: {
    title: string;
    content: string;
    timestamp: string;
  };
  error?: string;
}

export default function CsrfExample() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get CSRF token from auth context or localStorage on component mount
  useEffect(() => {
    // In a real app, you'd get this from your auth context
    // This assumes the token was stored in localStorage during login
    const token = localStorage.getItem('csrfToken');
    if (token) {
      setCsrfToken(token);
    } else {
      setError('No CSRF token found. Please log in again.');
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!csrfToken) {
        throw new Error('CSRF token is missing');
      }
      
      const res = await fetch('/api/admin/example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the CSRF token in the request header
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ title, content }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setResponse(data);
      // Reset form after successful submission
      setTitle('');
      setContent('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto border rounded-md p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">CSRF Protected Form</h2>
        <p className="text-gray-600 text-sm">This form demonstrates CSRF protection</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
            minLength={3}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder="Enter content"
            required
            minLength={10}
            rows={4}
            className="w-full p-2 border rounded-md"
          ></textarea>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {response && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p>Success! Response received:</p>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || !csrfToken}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || !csrfToken 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Protected Request'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-500">
        CSRF Token: {csrfToken ? `${csrfToken.substring(0, 10)}...` : 'None'}
      </div>
    </div>
  );
} 