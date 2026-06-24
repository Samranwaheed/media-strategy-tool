'use client';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    budget: 50000,
    market: 'United Arab Emirates',
    industry: 'Retail & E-commerce',
    age: '25-44',
    gender: 'All genders',
    primaryObjective: 'Sales & conversions',
    secondaryObjective: '',
    brief: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const objectives = ['Brand awareness', 'Lead generation', 'Sales & conversions', 'App installs', 'Engagement', 'Retargeting'];
  const COLORS = ['#6c2bd9', '#a855f7', '#3b82f6', '#06b6d4'];

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

  const removeFile = (id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fileIds: uploadedFiles.map((f) => f.id) }),
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

  const PieChart = ({ allocations, budget }) => {
    const size = 220;
    const cx = 110, cy = 110, r = 80;
    let cumulative = 0;
    const slices = allocations.map((a, i) => {
      const pct = a.percentage / 100;
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const large = pct > 0.5 ? 1 : 0;
      return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: COLORS[i % COLORS.length], label: a.platform, pct: a.percentage };
    });
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <svg width={size} height={size}>
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />)}
        </svg>
        <div>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{s.pct}% — ${Math.round(budget * s.pct / 100).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ReachCurve = ({ data }) => {
    if (!data || data.length === 0) return null;
    const w = 500, h = 200, pad = 50;
    const maxReach = Math.max(...data.map(d => d.reach));
    const points = data.map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - (d.reach / maxReach) * (h - pad * 2);
      return { x, y, ...d };
    });
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length-1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c2bd9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6c2bd9" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#reachGrad)" />
        <path d={pathD} fill="none" stroke="#6c2bd9" strokeWidth="3" strokeLinecap="round"
