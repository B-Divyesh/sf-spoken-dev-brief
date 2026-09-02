import { describe, expect, it } from 'vitest';
import { draftBrief, toJira, toMarkdown } from '../src/brief';
import { sampleBrief } from '../src/store';
describe('brief drafting', () => {
  it('separates decisions, assumptions, and questions', () => {
    const brief = draftBrief('We decided to use SQLite. Assume the directory is writable. Should we encrypt exports?');
    expect(brief.decisions).toEqual(['We decided to use SQLite']);
    expect(brief.assumptions).toEqual(['Assume the directory is writable']);
    expect(brief.questions).toEqual(['Should we encrypt exports']);
  });
  it('exports complete Markdown and Jira records', () => {
    const brief = sampleBrief(); brief.status = 'confirmed';
    expect(toMarkdown(brief)).toContain('`src/lib/sync.ts:48`');
    expect(toMarkdown(brief)).toContain('**Status:** Confirmed');
    expect(toJira(brief)).toContain('h2. Open questions');
  });
});
