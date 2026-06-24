export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, primaryObjective, secondaryObjective, brief, fileIds } = body;

    const userContent = [];

    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        userContent.push({ type: 'document', source: { type: 'file', file_id: fileId } });
      }
      userContent.push({ type: 'text', text: 'The documents above may contain CPM benchmarks or past campaign data. Extract any CPM values mentioned and use them for reach calculations.' });
    }

    userContent.push({
      type: 'text',
      text: `You are a senior media strategist. Create a detailed media strategy for this campaign.
Budget: $${budget}
Market: ${market}
Industry: ${industry}
Audience: ${age}, ${gender}
Primary Objective: ${primaryObjective}
Secondary Objective: ${secondaryObjective || 'None'}
Brief: ${brief || 'General campaign'}

Use realistic CPM benchmarks for the ${market} market. Include OOH and Radio if the budget supports it.
Sort platforms by highest estimated reach first.

Respond with ONLY this JSON, no other text:
{
  "title": "campaign name",
  "summary": "2 sentence summary",
  "allocations": [
    {
      "platform": "Meta",
      "percentage": 35,
      "budget": 0,
      "cpm": 5.5,
      "frequency": 3,
      "estimatedReach": 500000,
      "mainKPI": "ROAS 3x",
      "rationale": "reason"
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
        max_tokens: 2048,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    const message = await response.json();
    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));

    // Calculate budget and reach for each platform
    parsed.allocations = parsed.allocations.map(a => {
      const platformBudget = Math.round(budget * a.percentage / 100);
      const reach = Math.round((platformBudget / a.cpm) * 1000 / a.frequency);
      return { ...a, budget: platformBudget, estimatedReach: reach };
    });

    // Sort by highest reach first
    parsed.allocations.sort((a, b) => b.estimatedReach - a.estimatedReach);

    // Calculate cumulative reach curve using independence model (ceiling) and exponential decay (floor)
    const decayFactor = 0.55;
    let ceilingPopulation = 0;
    let floorReach = 0;
    const targetPopulation = 10000000; // assume 10M addressable audience

    parsed.reachCurve = parsed.allocations.map((a, i) => {
      const platformReachRate = a.estimatedReach / targetPopulation;

      // Ceiling: independence model
      ceilingPopulation = 1 - (1 - ceilingPopulation) * (1 - platformReachRate);
      const ceiling = Math.round(ceilingPopulation * targetPopulation);

      // Floor: exponential decay on incremental
      const incrementalDecayed = i === 0
        ? a.estimatedReach
        : Math.round(a.estimatedReach * Math.pow(decayFactor, i));
      floorReach = Math.min(floorReach + incrementalDecayed, ceiling);

      return {
        platform: i === 0 ? a.platform : parsed.allocations.slice(0, i + 1).map(p => p.platform).join('+'),
        ceiling,
        floor: floorReach,
        added: a.platform,
      };
    });

    return Response.json(parsed);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
