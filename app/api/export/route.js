import PptxGenJS from 'pptxgenjs';

export async function POST(request) {
  try {
    const { result, formData } = await request.json();
    const prs = new PptxGenJS();

    const labelStyle = { fontSize: 11, bold: true, color: '888888' };
    const bodyStyle = { fontSize: 12, color: '333333' };

    const s1 = prs.addSlide();
    s1.addText(result.title, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 28, bold: true, color: '363636' });
    s1.addText(result.summary, { x: 0.5, y: 2.8, w: 9, h: 2, ...bodyStyle, fontSize: 14 });
    s1.addText('Market: ' + formData.market + '   |   Industry: ' + formData.industry + '   |   Budget: $' + formData.budget.toLocaleString(), { x: 0.5, y: 5, w: 9, h: 0.5, fontSize: 11, color: '888888' });

    const s2 = prs.addSlide();
    s2.addText('BUDGET ALLOCATION', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
    const tableRows = [
      [
        { text: 'Platform', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Budget', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Est. Reach', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Key KPI', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        { text: 'Rationale', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
      ],
      ...result.allocations.map(a => [
        { text: a.platform },
        { text: '$' + (a.budget || Math.round(formData.budget * a.percentage / 100)).toLocaleString() },
        { text: a.estimatedReach ? (a.estimatedReach / 1000).toFixed(0) + 'K' : '-' },
        { text: a.mainKPI || '-' },
        { text: a.rationale },
      ]),
    ];
    s2.addTable(tableRows, { x: 0.5, y: 1, w: 9, fontSize: 11, border: { type: 'solid', color: 'e0e0e0' } });

    if (result.reachCurve) {
      const s3 = prs.addSlide();
      s3.addText('REACH BUILD-UP', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
      const reachRows = [
        [
          { text: 'Month', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
          { text: 'Estimated Reach', options: { bold: true, fill: 'f0ebff', color: '6c2bd9' } },
        ],
        ...result.reachCurve.map(r => [
          { text: r.month },
          { text: (r.reach / 1000).toFixed(0) + 'K' },
        ]),
      ];
      s3.addTable(reachRows, { x: 0.5, y: 1, w: 5, fontSize: 12, border: { type: 'solid', color: 'e0e0e0' } });
    }

    const s4 = prs.addSlide();
    s4.addText('STRATEGY', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
    s4.addText(result.strategy, { x: 0.5, y: 1, w: 9, h: 4, ...bodyStyle });

    if (result.insights) {
      const s5 = prs.addSlide();
      s5.addText('INSIGHTS', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
      result.insights.forEach((ins, i) => {
        s5.addText(ins.label, { x: 0.5, y: 1 + i * 1.2, w: 9, h: 0.4, fontSize: 13, bold: true, color: '6c2bd9' });
        s5.addText(ins.text, { x: 0.5, y: 1.4 + i * 1.2, w: 9, h: 0.6, fontSize: 12, color: '555555' });
      });
    }

    if (result.kpis) {
      const s6 = prs.addSlide();
      s6.addText('KPIs', { x: 0.5, y: 0.3, w: 9, h: 0.5, ...labelStyle });
      result.kpis.forEach((kpi, i) => {
        s6.addText('- ' + kpi, { x: 0.5, y: 1 + i * 0.6, w: 9, h: 0.5, fontSize: 13, color: '333333' });
      });
    }

    const buffer = await prs.write({ outputType: 'nodebuffer' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="strategy.pptx"',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
