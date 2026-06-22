import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, objective, brief } = body;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a senior media strategist. Create a detailed media strategy.

Budget: $${budget}
Market: ${market}
Industry: ${industry}
Audience: ${age}, ${gender}
Objective: ${objective}
Brief: ${brief || 'General campaign'}

Respond with ONLY this JSON structure, no other text:
{
  "title": "campaign name here",
  "summary": "2 sentence summary here",
  "allocations": [
    {"platform": "Meta", "percentage": 35, "rationale": "reason"},
    {"platform": "Google", "percentage": 25, "rationale": "reason"},
    {"platform": "TikTok", "percentage": 20, "rationale": "reason"},
    {"platform": "YouTube", "percentage": 20, "rationale": "reason"}
  ],
  "strategy": "detailed strategy paragraph here",
  "insights": [
    {"label": "Market Insight", "text": "insight text"},
    {"label": "Audience Insight", "text": "insight text"},
    {"label": "Channel Insight", "text": "insight text"}
  ],
  "kpis": ["KPI 1", "KPI 2", "KPI 3", "KPI 4"]
}`
        }
      ]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    const parsed = JSON.parse(clean.slice(start, end + 1));
    return Response.json(parsed);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
