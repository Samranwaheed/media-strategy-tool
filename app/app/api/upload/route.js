import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const uploadedFile = await client.beta.files.upload(
      { file: file },
      { headers: { 'anthropic-beta': 'files-api-2025-04-14' } }
    );

    return Response.json({ 
      fileId: uploadedFile.id,
      fileName: file.name,
      success: true 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
