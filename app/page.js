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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>CAMPAIGN OBJECTIVE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {objectives.map(obj => (
              <button key={obj} onClick={() => setFormData({ ...formData, objective: obj })} style={{ padding: '8px 18px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, borderColor: formData.objective === obj ? '#6c2bd9' : '#ddd', background: formData.objective === obj ? '#6c2bd9' : '#fff', color: formData.objective === obj ? '#fff' : '#333' }}>
                {obj}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>CAMPAIGN BRIEF</div>
          <textarea placeholder="Describe your product, target audience, key message, or any specific requirements..." value={formData.brief} onChange={(e) => setFormData({ ...formData, brief: e.target.value })} rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>REFERENCE DOCUMENTS (OPTIONAL)</div>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#666' }}>Upload past campaign reports or briefs. The AI will use them to inform the strategy.</p>
          <label style={{ display: 'inline-block', padding: '10px 20px', background: '#f0ebff', color: '#6c2bd9', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', border: '1px dashed #6c2bd9' }}>
            {uploading ? 'Uploading...' : '+ Upload Document'}
            <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
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
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem' }}>{result.title}</h2>
              <p style={{ margin: 0, color: '#555', lineHeight: 1.7 }}>{result.summary}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '20px' }}>BUDGET ALLOCATION</div>
              {result.allocations && result.allocations.map((a) => (
                <div key={a.platform} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{a.platform}</span>
                    <span style={{ color: '#6c2bd9', fontWeight: 700 }}>{a.percentage}% — ${Math.round(formData.budget * a.percentage / 100).toLocaleString()}</span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                    <div style={{ background: '#6c2bd9', width: `${a.percentage}%`, height: '8px', borderRadius: '4px' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>{a.rationale}</div>
                </div>
              ))}
            </div>
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
                  {result.kpis.map((kpi) => (
                    <span key={kpi} style={{ padding: '6px 14px', background: '#f0ebff', color: '#6c2bd9', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>{kpi}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
