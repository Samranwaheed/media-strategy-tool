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

      <div
