'use client';
import { useState } from 'react';

export default function Admin() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const newFile = { id: data.fileId, name: data.fileName };
        const updated = [...files, newFile];
        setFiles(updated);
        localStorage.setItem('uploadedFiles', JSON.stringify(updated));
        setMessage(`✅ Uploaded! File ID: ${data.fileId}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      setMessage('❌ Upload failed');
    }
    setUploading(false);
  }

  function removeFile(id) {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    localStorage.setItem('uploadedFiles', JSON.stringify(updated));
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, background: '#6c63ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>M</div>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>MediaStrategyAI — Admin</span>
      </div>
      <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Document Manager</h1>
        <p style={{ color: '#666', marginBottom: 32 }}>Upload your campaign reports and benchmark documents. Claude will reference these in every strategy generated.</p>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Upload Document</h3>
          <label style={{ display: 'block', padding: 32, border: '2px dashed #ddd', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: '#f8f9ff' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#444', marginBottom: 4 }}>Click to upload a document</div>
            <div style={{ fontSize: 13, color: '#888' }}>PDF, TXT, DOCX supported</div>
            <input type="file" accept=".pdf,.txt,.docx" onChange={uploadFile} style={{ display: 'none' }} disabled={uploading} />
          </label>
          {message && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: message.includes('✅') ? '#f0fff4' : '#fff5f5', color: message.includes('✅') ? '#276749' : '#cc0000', fontSize: 14 }}>
              {message}
            </div>
          )}
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Uploaded Documents</h3>
          {files.length === 0 ? (
            <p style={{ color: '#888', fontSize: 14 }}>No documents uploaded yet.</p>
          ) : (
            files.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{f.id}</div>
                </div>
                <button onClick={() => removeFile(f.id)} style={{ padding: '6px 12px', background: '#fff5f5', color: '#cc0000', border: '1px solid #ffcccc', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Remove</button>
              </div>
            ))
          )}
        </div>
        <div style={{ marginTop: 16, padding: 16, background: '#f0eeff', borderRadius: 12, fontSize: 13, color: '#534AB7' }}>
          <strong>How it works:</strong> Documents uploaded here are sent to Anthropic's storage. Claude automatically reads them when generating strategies on the main page.
        </div>
      </div>
    </main>
  );
}
