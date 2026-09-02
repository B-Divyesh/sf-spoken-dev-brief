import type { Brief } from './types';

const clean = (line: string) => line.replace(/^[-*\d.)\s]+/, '').trim();

export function draftBrief(transcript: string, author = 'Unassigned'): Brief {
  const sentences = transcript.split(/(?<=[.!?])\s+|\n+/).map(clean).filter(Boolean);
  const decisions: string[] = [];
  const assumptions: string[] = [];
  const questions: string[] = [];

  for (const sentence of sentences) {
    const plain = sentence.replace(/[.!?]+$/, '');
    if (/\?|open question|need to (?:check|decide|confirm)|should we/i.test(sentence)) questions.push(plain);
    else if (/assum(?:e|ing|ption)|expect|probably|for now/i.test(sentence)) assumptions.push(plain);
    else if (/decid(?:e|ed)|will |use |keep |move |ship |must |won't|do not/i.test(sentence)) decisions.push(plain);
  }

  if (!decisions.length && sentences[0]) decisions.push(sentences[0].replace(/[.!?]+$/, ''));
  const titleSource = decisions[0] || 'Untitled implementation decision';
  return {
    id: crypto.randomUUID(),
    title: titleSource.split(/\s+/).slice(0, 9).join(' '),
    author,
    createdAt: new Date().toISOString(),
    transcript,
    decisions: decisions.slice(0, 5),
    assumptions: assumptions.slice(0, 5),
    questions: questions.slice(0, 5),
    references: [],
    status: 'draft'
  };
}

export function toMarkdown(brief: Brief): string {
  const list = (items: string[]) => items.length ? items.map(x => `- ${x}`).join('\n') : '- None recorded';
  const refs = brief.references.length
    ? brief.references.map(r => `- \`${r.path}\`${r.note ? ` — ${r.note}` : ''}`).join('\n')
    : '- None linked';
  return `# ${brief.title}\n\n**Status:** ${brief.status === 'confirmed' ? 'Confirmed' : 'Draft'}  \n**Owner:** ${brief.author}  \n**Recorded:** ${new Date(brief.createdAt).toISOString()}${brief.confirmedAt ? `  \n**Confirmed:** ${new Date(brief.confirmedAt).toISOString()}` : ''}\n\n## Decisions\n\n${list(brief.decisions)}\n\n## Assumptions\n\n${list(brief.assumptions)}\n\n## Open questions\n\n${list(brief.questions)}\n\n## Repository references\n\n${refs}\n\n## Source transcript\n\n> ${brief.transcript.replace(/\n/g, '\n> ')}\n`;
}

export function toJira(brief: Brief): string {
  const section = (name: string, items: string[]) => `h2. ${name}\n${items.length ? items.map(x => `* ${x}`).join('\n') : '* None recorded'}`;
  return `h1. ${brief.title}\n_Status: ${brief.status} | Owner: ${brief.author}_\n\n${section('Decisions', brief.decisions)}\n\n${section('Assumptions', brief.assumptions)}\n\n${section('Open questions', brief.questions)}\n\n${section('Repository references', brief.references.map(r => `{{${r.path}}}${r.note ? ` — ${r.note}` : ''}`))}`;
}
