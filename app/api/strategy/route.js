import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, objective, brief, fileIds } = body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build message content - start with the strategy request
    const userContent = [];

    // Add uploaded documents if any
    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        userContent.push({
          type: 'document',
          source: { type: 'file', file_id: fileId }
        });
      }
      userContent.push({
        type: 'text',
        text: `The documents above contain our agency's past campaign data and benchmarks. Use them to inform your strategy.`
      });
    }

    // Add the main strategy prompt
    userContent.push({
      type: 'text',
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
    });

    const message = await client.beta.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: userContent }],
      betas: ['files-api-2025-04-14']
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
