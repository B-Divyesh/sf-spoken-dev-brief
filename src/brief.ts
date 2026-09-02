import type { Brief } from './types';

const clean = (line: string) => line.replace(/^[-*\d.)\s]+/, '').trim();

const REPOSITORY_PATH = /(?:\.{0,2}\/)?(?:[A-Za-z0-9_@.-]+\/)+[A-Za-z0-9_@.-]+(?::\d+(?::\d+)?)?/g;

function extractReferences(transcript: string): Brief['references'] {
  const seen = new Set<string>();
  const references: Brief['references'] = [];
  for (const match of transcript.matchAll(REPOSITORY_PATH)) {
    const path = match[0].replace(/[),.;]+$/, '');
    if (!seen.has(path)) {
      seen.add(path);
      references.push({ path, note: 'Mentioned in transcript' });
    }
  }
  return references.slice(0, 10);
}

function extractOwner(transcript: string, fallback: string): string {
  const name = String.raw`(@?[A-Z][A-Za-z0-9_'’-]*(?:\s+[A-Z][A-Za-z0-9_'’-]*)?)`;
  const patterns = [
    new RegExp(String.raw`(?:owner(?:\s+is|\s*[:=-])|owned\s+by|assign(?:ed)?\s+to)\s+${name}`, 'i'),
    new RegExp(String.raw`${name}\s+(?:owns\b|is\s+(?:the\s+)?owner\b|will\s+own\b)`),
  ];
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match?.[1]) return match[1].replace(/^@/, '').trim();
  }
  return fallback;
}

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
    author: extractOwner(transcript, author),
    createdAt: new Date().toISOString(),
    transcript,
    decisions: decisions.slice(0, 5),
    assumptions: assumptions.slice(0, 5),
    questions: questions.slice(0, 5),
    references: extractReferences(transcript),
    status: 'draft'
  };
}

export function toMarkdown(brief: Brief): string {
  if (brief.status !== 'confirmed') throw new Error('Confirm the brief before exporting it.');
  const list = (items: string[]) => items.length ? items.map(x => `- ${x}`).join('\n') : '- None recorded';
  const refs = brief.references.length
    ? brief.references.map(r => `- \`${r.path}\`${r.note ? ` — ${r.note}` : ''}`).join('\n')
    : '- None linked';
  return `# ${brief.title}\n\n**Status:** ${brief.status === 'confirmed' ? 'Confirmed' : 'Draft'}  \n**Owner:** ${brief.author}  \n**Recorded:** ${new Date(brief.createdAt).toISOString()}${brief.confirmedAt ? `  \n**Confirmed:** ${new Date(brief.confirmedAt).toISOString()}` : ''}\n\n## Decisions\n\n${list(brief.decisions)}\n\n## Assumptions\n\n${list(brief.assumptions)}\n\n## Open questions\n\n${list(brief.questions)}\n\n## Repository references\n\n${refs}\n\n## Source transcript\n\n> ${brief.transcript.replace(/\n/g, '\n> ')}\n`;
}

export function toJira(brief: Brief): string {
  if (brief.status !== 'confirmed') throw new Error('Confirm the brief before exporting it.');
  const section = (name: string, items: string[]) => `h2. ${name}\n${items.length ? items.map(x => `* ${x}`).join('\n') : '* None recorded'}`;
  return `h1. ${brief.title}\n_Status: ${brief.status} | Owner: ${brief.author}_\n\n${section('Decisions', brief.decisions)}\n\n${section('Assumptions', brief.assumptions)}\n\n${section('Open questions', brief.questions)}\n\n${section('Repository references', brief.references.map(r => `{{${r.path}}}${r.note ? ` — ${r.note}` : ''}`))}`;
}
