export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, primaryObjective, secondaryObjective, brief, fileIds } = body;

    const userContent = [];

    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        userContent.push({ type: 'document', source: { type: 'file', file_id: fileId } });
      }
      userContent.push({ type: 'text', text: `The documents above contain our agency's past campaign data. Use them to inform your strategy.` });
    }

    userContent.push({
      type: 'text',
      text: `You are a senior media strategist. Create a detailed media strategy.
Budget: $${budget}
Market: ${market}
Industry: ${industry}
Audience: ${age}, ${gender}
Primary Objective: ${primaryObjective}
Secondary Objective: ${secondaryObjective || 'None'}
Brief: ${brief || 'General campaign'}

Respond with ONLY this JSON, no other text:
{
  "title": "campaign name",
  "summary": "2 sentence summary",
  "allocations": [
    {"platform": "Meta", "percentage": 35, "budget": 0, "estimatedReach": 500000, "mainKPI": "ROAS 3x", "rationale": "reason"},
    {"platform": "Google", "percentage": 25, "budget": 0, "estimatedReach": 300000, "mainKPI": "CPC $0.8", "rationale": "reason"},
    {"platform": "TikTok", "percentage": 20, "budget": 0, "estimatedReach": 400000, "mainKPI": "CPM $4", "rationale": "reason"},
    {"platform": "YouTube", "percentage": 20, "budget": 0, "estimatedReach": 200000, "mainKPI": "VTR 30%", "rationale": "reason"}
  ],
  "reachCurve": [
    {"month": "Month 1", "reach": 200000},
    {"month": "Month 2", "reach": 500000},
    {"month": "Month 3", "reach": 900000}
  ],
  "strategy": "detailed strategy paragraph",
  "insights": [
    {"label": "Market Insight", "text": "insight"},
    {"label": "Audience Insight", "text": "insight"},
    {"label": "Channel Insight", "text": "insight"}
  ],
  "kpis": ["KPI 1", "KPI 2", "KPI 3", "KPI 4"]
}`
    });

    let message;
    if (fileIds && fileIds.length > 0) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'files-api-2025-04-14',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{ role: 'user', content: userContent }],
        }),
      });
      message = await response.json();
      const text = message.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
      parsed.allocations = parsed.allocations.map(a => ({ ...a, budget: Math.round(budget * a.percentage / 100) }));
      return Response.json(parsed);
    } else {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{ role: 'user', content: userContent }],
        }),
      });
      message = await response.json();
      const text = message.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
      parsed.allocations = parsed.allocations.map(a => ({ ...a, budget: Math.round(budget * a.percentage / 100) }));
      return Response.json(parsed);
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
