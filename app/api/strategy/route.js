import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  const { budget, market, industry, age, gender, objective, brief } = await request.json();

  const prompt = `You are a senior media strategist with 15 years experience. Generate a media strategy for:

BUDGET: $${budget}
MARKET: ${market}
INDUSTRY: ${industry}
AUDIENCE: ${age}, ${gender}
OBJECTIVE: ${objective}
BRIEF: ${brief || 'No brief provided'}

Respond in this exact JSON format only, no other text:
{
  "title": "Campaign strategy name",
  "summary": "2 sentence executive summary",
  "allocations": [
    {"platform": "Platform name", "percentage": 30, "rationale": "One line why"}
  ],
  "strategy": "3-4 paragraph detailed strategy",
  "insights": [
    {"label": "Insight label", "text": "Insight detail"}
  ],
  "kpis": ["KPI 1", "KPI 2", "KPI 3", "KPI 4"]
}

Percentages must add to 100. Be specific and data-driven for ${market}.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return Response.json(parsed);
}
