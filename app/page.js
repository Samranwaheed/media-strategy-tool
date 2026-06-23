'use client';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    budget: 50000,
    market: 'United Arab Emirates',
    industry: 'Retail & E-commerce',
    age: '25-44',
    gender: 'All genders',
    objective: 'Sales & conversions',
    brief: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const objectives = ['Brand awareness', 'Lead generation', 'Sales & conversions', 'App installs', 'Engagement', 'Retargeting'];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadedFiles((prev) => [...prev, { id: data.fileId, name: data.fileName }]);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileIds: uploadedFiles.map((f) => f.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f4f4f8', fontFamily: 'system-ui, sans-serif', paddingBottom: '60px' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '20px 40px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Media Strategy Generator</h1>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.95rem' }}>Enter your campaign details and get an AI-generated media strategy with budget allocation</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 20px' }}>

        {/* BUDGET */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>BUDGET</div>
          <input type="range" min="1000" max="1000000" step="1000"
            value={formData.budget}
            onChange={(e) => setFormData({
