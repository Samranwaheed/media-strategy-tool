import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, objective, brief } = body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a senior media strategist. Generate a media strategy. Budget: $${budget}, Market: ${market}, Industry: ${industry}, Audience: ${age} ${gender}, Objective: ${objective}, Brief: ${brief || 'none'}. Return ONLY raw JSON, no markdown, no backticks, starting with { and ending with }.`
        },
        {
          role: 'assistant',
          content: '{'
        }
      ]
    });

    const text = '{' + message.content[0].text;
    const end = text.lastIndexOf('}');
    const parsed = JSON.parse(text.slice(0, end + 1));
    return Response.json(parsed);

  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
