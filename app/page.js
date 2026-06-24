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
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, formData }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (result.title || 'strategy') + '.pptx';
    a.click();
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
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />)}
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
          <input type="range" min="1000" max="1000000" step="1000" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} style={{ width: '100%', marginBottom: '8px' }} />
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.4rem' }}>${formData.budget.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>MARKET & AUDIENCE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Market</label>
              <select value={formData.market} onChange={(e) => setFormData({ ...formData, market: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}>
                {['United Arab Emirates','Saudi Arabia','Egypt','Kuwait','Qatar','Bahrain','Oman','Jordan','Lebanon','Global'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Industry</label>
              <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}>
                {['Retail & E-commerce','Finance & Banking','Healthcare','Real Estate','Food & Beverage','Automotive','Education','Travel & Tourism','Technology','Fashion & Beauty'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Age Group</label>
              <select value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}>
                {['18-24','25-34','25-44','35-54','45-64','55+','All ages'].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}>
                {['All genders','Male skew','Female skew'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>CAMPAIGN OBJECTIVES</div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '10px', fontWeight: 600 }}>Primary Objective</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {objectives.map(obj => (
                <button key={obj} onClick={() => setFormData({ ...formData, primaryObjective: obj })} style={{ padding: '8px 18px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, borderColor: formData.primaryObjective === obj ? '#6c2bd9' : '#ddd', background: formData.primaryObjective === obj ? '#6c2bd9' : '#fff', color: formData.primaryObjective === obj ? '#fff' : '#333' }}>{obj}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '10px', fontWeight: 600 }}>Secondary Objective <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {objectives.filter(o => o !== formData.primaryObjective).map(obj => (
                <button key={obj} onClick={() => setFormData({ ...formData, secondaryObjective: formData.secondaryObjective === obj ? '' : obj })} style={{ padding: '8px 18px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, borderColor: formData.secondaryObjective === obj ? '#a855f7' : '#ddd', background: formData.secondaryObjective === obj ? '#a855f7' : '#fff', color: formData.secondaryObjective === obj ? '#fff' : '#333' }}>{obj}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>CAMPAIGN BRIEF</div>
          <textarea placeholder="Describe your product, target audience, key message, or any specific requirements..." value={formData.brief} onChange={(e) => setFormData({ ...formData, brief: e.target.value })} rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>REFERENCE DOCUMENTS (OPTIONAL)</div>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#666' }}>Upload past campaign reports or briefs (PDF or TXT only).</p>
          <label style={{ display: 'inline-block', padding: '10px 20px', background: '#f0ebff', color: '#6c2bd9', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', border: '1px dashed #6c2bd9' }}>
            {uploading ? 'Uploading...' : '+ Upload Document'}
            <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              {uploadedFiles.map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '8px', border: '1px solid #eee' }}>
                  <span style={{ fontSize: '0.9rem', color: '#333' }}>📄 {f.name}</span>
                  <button onClick={() => removeFile(f.id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '18px', borderRadius: '10px', border: 'none', background: '#6c2bd9', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating...' : 'Generate Media Strategy'}
        </button>
        {error && <div style={{ marginTop: '16px', padding: '14px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: '8px', color: '#c00' }}>{error}</div>}
        {result && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Strategy Output</h2>
              <button onClick={exportPPT} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #6c2bd9', background: '#fff', color: '#6c2bd9', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>Export PPT</button>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem' }}>{result.title}</h2>
              <p style={{ margin: 0, color: '#555', lineHeight: 1.7 }}>{result.summary}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '24px' }}>BUDGET ALLOCATION</div>
              {result.allocations && <PieChart allocations={result.allocations} budget={formData.budget} />}
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0', overflowX: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>PLATFORM BREAKDOWN</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    {['Platform','Budget','Est. Reach','Key KPI','Rationale'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {result.allocations && result.allocations.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length], marginRight: '8px' }} />{a.platform}</td>
                      <td style={{ padding: '12px', color: '#6c2bd9', fontWeight: 600 }}>${(a.budget || Math.round(formData.budget * a.percentage / 100)).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{a.estimatedReach ? (a.estimatedReach / 1000).toFixed(0) + 'K' : '-'}</td>
                      <td style={{ padding: '12px' }}>{a.mainKPI || '-'}</td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>{a.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.reachCurve && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>REACH BUILD-UP CURVE</div>
                <ReachCurve data={result.reachCurve} />
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '12px' }}>STRATEGY</div>
              <p style={{ margin: 0, lineHeight: 1.8, color: '#333' }}>{result.strategy}</p>
            </div>
            {result.insights && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>INSIGHTS</div>
                {result.insights.map((ins) => (
                  <div key={ins.label} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '3px solid #6c2bd9' }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>{ins.label}</div>
                    <div style={{ color: '#555', fontSize: '0.9rem' }}>{ins.text}</div>
                  </div>
                ))}
              </div>
            )}
            {result.kpis && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>KPIs</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {result.kpis.map((kpi) => <span key={kpi} style={{ padding: '6px 14px', background: '#f0ebff', color: '#6c2bd9', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>{kpi}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
