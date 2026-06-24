'use client';

export default function ExportButton({ result, formData }) {
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

  return (
    <button onClick={exportPPT} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #6c2bd9', background: '#fff', color: '#6c2bd9', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
      Export PPT
    </button>
  );
}
