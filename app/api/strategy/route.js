import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, objective, brief } = body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a senior media strategist. Generate a media strategy for:
BUDGET: $${budget}
MARKET: ${market}
INDUSTRY: ${industry}
AUDIENCE: ${age}, ${gender}
OBJECTIVE: ${objective}
BRIEF: ${brief || 'No brief provided'}

Respond in this exact JSON format only, no markdown, no extra text:
{"title":"Campaign name","summary":"2 sentence summary","allocations":[{"platform":"Platform","percentage":30,"rationale":"Why"}],"strategy":"3-4 paragraph strategy","insights":[{"label":"Label","text":"Detail"}],"kpis":["KPI1","KPI2","KPI3"]}`
      }]
    });

    const text = message.content[0].text;
    const parsed = JSON.parse(text.trim());
    return Response.json(parsed);

  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
