export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, primaryObjective, secondaryObjective, brief, fileIds } = body;

    const userContent = [];

    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        userContent.push({ type: 'document', source: { type: 'file', file_id: fileId } });
      }
      userContent.push({ type: 'text', text: 'The documents above may contain CPM benchmarks. Extract any CPM values and use them for reach calculations.' });
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

Use realistic CPM benchmarks for ${market}. Include OOH and Radio if budget supports it.
Keep rationale under 10 words each.

Respond with ONLY this JSON, no other text:
{
  "title": "campaign name",
  "summary": "2 sentence summary",
  "allocations": [
    {
      "platform": "Meta",
      "percentage": 35,
      "cpm": 5.5,
      "frequency": 3,
      "mainKPI": "ROAS 3x",
      "rationale": "brief reason"
    }
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

    const headers = {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    };

    if (fileIds && fileIds.length > 0) {
      headers['anthropic-beta'] = 'files-api-2025-04-14';
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    const message = await response.json();
    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));

    parsed.allocations = parsed.allocations.map(a => {
      const platformBudget = Math.round(budget * a.percentage / 100);
      const cpm = parseFloat(a.cpm) || 5;
      const frequency = parseFloat(a.frequency) || 3;
      const reach = Math.round((platformBudget / cpm) * 1000 / frequency);
      return { ...a, budget: platformBudget, cpm, frequency, estimatedReach: reach };
    });

    parsed.allocations.sort((a, b) => b.estimatedReach - a.estimatedReach);

    return Response.json(parsed);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
