'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [budget, setBudget] = useState(50000);
  const [market, setMarket] = useState('United Arab Emirates');
  const [industry, setIndustry] = useState('Retail & E-commerce');
  const [age, setAge] = useState('25-44');
  const [gender, setGender] = useState('All genders');
  const [objective, setObjective] = useState('Brand awareness');
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileIds, setFileIds] = useState([]);

  const objectives = ['Brand awareness','Lead generation','Sales & conversions','App installs','Engagement','Retargeting'];
  const markets = ['United Arab Emirates','Saudi Arabia','GCC (All markets)','United Kingdom','United States','Global'];
  const industries = ['Retail & E-commerce','Real Estate','Finance & Banking','FMCG','Automotive','Travel & Hospitality','Technology','Healthcare','Luxury','Education'];

  useEffect(() => {
    const saved = localStorage.getItem('uploadedFiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFileIds(parsed.map(f => f.id));
    }
  }, []);

  async function generate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, market, industry, age, gender, objective, brief, fileIds })
      });
      const text = await res.text();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('Invalid response');
      const data = JSON.parse(text.slice(start, end + 1));
      setResult(data);
    } catch(e) {
      setResult({ error: 'Something went wrong. Please try again.' });
    }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: '#6c63ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>M</div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>MediaStrategyAI</span>
          <span style={{ background: '#6c63ff22', color: '#a89cff', fontSize: 11, padding: '2px 8px', borderRadius: 20, border: '1px solid #6c63ff44' }}>BETA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {fileIds.length > 0 && (
            <span style={{ color: '#a89cff', fontSize: 13 }}>📄 {fileIds.length} document{fileIds.length > 1 ? 's' : ''} loaded</span>
          )}
          <a href="/admin" style={{ color: '#a89cff', fontSize: 13, textDecoration: 'none' }}>Admin ↗</a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Media Strategy Generator</h1>
          <p style={{ color: '#666', marginTop: 8, fontSize: 15 }}>Enter your campaign details and get an AI-generated media strategy with budget allocation</p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input type="range" min="5000" max="500000" step="5000" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', minWidth: 120 }}>${budget.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market & Audience</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>Market</label>
                <select value={market} onChange={e => setMarket(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                  {markets.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>Industry</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                  {industries.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>Age Group</label>
                <select value={age} onChange={e => setAge(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                  {['18-24','25-34','25-44','35-54','45+','All ages'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                  {['All genders','Male skew','Female skew'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaign Objective</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {objectives.map(o => (
                <button key={o} onClick={() => setObjective(o)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${objective === o ? '#6c63ff' : '#ddd'}`, background: objective === o ? '#6c63ff' : 'white', color: objective === o ? 'white' : '#444', fontSize: 13, cursor: 'pointer' }}>{o}</button>
              ))}
            </div>
          </div>

          <div style={{ background: 'white',
