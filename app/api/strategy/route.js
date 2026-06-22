export async function POST(request) {
  try {
    const body = await request.json();
    const { budget, market, industry, age, gender, objective, brief } = body;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Media strategy for: Budget $${budget}, Market ${market}, Industry ${industry}, Audience ${age} ${gender}, Objective ${objective}, Brief: ${brief || 'none'}. Return ONLY a JSON object, no markdown.`
          },
          {
            role: 'assistant',
            content: '{"title":'
          }
        ]
      })
    });

    const json = await res.json();
    const raw = '{"title":' + json.content[0].text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return Response.json(parsed);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
