export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const response = await fetch('https://api.anthropic.com/v1/files', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'files-api-2025-04-14',
      },
      body: (() => {
        const fd = new FormData();
        fd.append('file', new Blob([buffer], { type: file.type || 'application/pdf' }), file.name);
        return fd;
      })(),
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: result.error?.message || 'Upload failed' }, { status: 500 });
    }

    return Response.json({
      fileId: result.id,
      fileName: file.name,
      success: true,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
