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

  const exportPPT = async () => {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const prs = new PptxGenJS();

    const labelStyle = { fontSize: 11, bold: true, color: '888888' };
    const bodyStyle = { fontSize: 13, color: '333333' };

    const s1 = prs.addSlide();
    s1.addText(result.title, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 28, bold: true, color: '363636' });
    s1.addText(result.summary, { x: 0.5, y: 2.8, w: 9, h: 2, ...bodyStyle, fontSize: 14 });
    s1.addText('Market: ' + formData.market + '   |   Industry: ' + formData.industry + '   |   Budget: $' + formData.budget.toLocaleString(), { x: 0.5, y: 5, w: 9, h: 0.5, fontSize: 11, color: '888888' });

    const s2 = prs.addSlide();
    s2.addText('BUDGET ALLOCATION', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
    const tableRows = [
      [
        { text: 'Platform', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Budget', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Est. Reach', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Key KPI', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Rationale', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
      ],
      ...result.allocations.map(a => [
        { text: a.platform },
        { text: '$' + (a.budget || Math.round(formData.budget * a.percentage / 100)).toLocaleString() },
        { text: a.estimatedReach ? (a.estimatedReach / 1000).toFixed(0) + 'K' : '-' },
        { text: a.mainKPI || '-' },
        { text: a.rationale },
      ]),
    ];
    s2.addTable(tableRows, { x: 0.5, y: 1, w: 9, fontSize: 11, border: { type: 'solid', color: 'e0e0e0' } });

    if (result.reachCurve) {
      const s3 = prs.addSlide();
      s3.addText('REACH BUILD-UP', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
      const reachRows = [
        [
          { text: 'Month', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
          { text: 'Estimated Reach', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        ],
        ...result.reachCurve.map(r => [
          { text: r.month },
          { text: (r.reach / 1000).toFixed(0) + 'K' },
        ]),
      ];
      s3.addTable(reachRows, { x: 0.5, y: 1, w: 5, fontSize: 12, border: { type: 'solid', color: 'e0e0e0' } });
    }

    const s4 = prs.addSlide();
    s4.addText('STRATEGY', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
    s4.addText(result.strategy, { x: 0.5, y: 1, w: 9, h: 4, ...bodyStyle, fontSize: 12 });

    if (result.insights) {
      const s5 = prs.addSlide();
      s5.addText('INSIGHTS', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
      result.insights.forEach((ins, i) => {
        s5.addText(ins.label, { x: 0.5, y: 1 + i * 1.2, w: 9, h: 0.4, fontSize: 13, bold: true, color: '6c2bd9' });
        s5.addText(ins.text, { x: 0.5, y: 1.4 + i * 1.2, w: 9, h: 0.6, fontSize: 12, color: '555555' });
      });
    }

    if (result.kpis) {
      const s6 = prs.addSlide();
      s6.addText('KPIs', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
      result.kpis.forEach((kpi, i) => {
        s6.addText('- ' + kpi, { x: 0.5, y: 1 + i * 0.6, w: 9, h: 0.5, fontSize: 13, color: '333333' });
      });
    }

    prs.writeFile({ fileName: result.title + '.pptx' });
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
      return {
        path: 'M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z',
        color: COLORS[i % COLORS.length],
        label: a.platform,
        pct: a.percentage,
      };
    });
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <svg width={size} height={size}>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
        <div>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{s.pct}% - ${Math.round(budget * s.pct / 100).toLocaleString()}</span>
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
      return { x, y, month: d.month, reach: d.reach };
    });
    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
    const areaD = pathD + ' L ' + points[points.length - 1].x + ' ' + (h - pad) + ' L ' + points[0].x + ' ' + (h - pad) + ' Z';
    return (
      <svg width="100%" viewBox={'0 0 ' + w + ' ' + h} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c2bd9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6c2bd9" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#reachGrad)" />
        <path d={pathD} fill="none" stroke="#6c2bd9" strokeWidth="3" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#6c2bd9" stroke="#fff" strokeWidth="2" />
            <text x={p.x} y={h - 10} textAnchor="middle" fontSize="13" fill="#666">{p.month}</text>
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="12" fill="#6c2bd9" fontWeight="600">{(p.reach / 1000).toFixed(0)}K</text>
          </g>
        ))}
        <line x1={pad} y1={pad / 2} x2={pad} y2={h - pad} stroke="#eee" strokeWidth="1" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#eee" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f4f4f8', fontFamily: 'system-ui, sans-serif', paddingBottom: '60px' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '20px 40px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Media Strategy Generator</h1>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.95rem' }}>Enter your campaign details and get an AI-generated media strategy with budget allocation</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 20px' }}>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>BUDGET</div>
          <input type="range" min="1000" max="1
