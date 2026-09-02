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
  it('extracts repository paths and the named owner from the verifier transcript', () => {
    const brief = draftBrief('We decided to cap retries in src/lib/sync.ts:48. Assume Retry-After is seconds. Should we move the queue limit to src/config/limits.ts? Maya owns the follow-up.');
    expect(brief.author).toBe('Maya');
    expect(brief.references.map(reference => reference.path)).toEqual([
      'src/lib/sync.ts:48',
      'src/config/limits.ts',
    ]);
  });
  it('rejects both export formats until a person confirms the brief', () => {
    const brief = sampleBrief();
    expect(() => toMarkdown(brief)).toThrow('Confirm the brief');
    expect(() => toJira(brief)).toThrow('Confirm the brief');
  });
  it('exports complete Markdown and Jira records', () => {
    const brief = sampleBrief(); brief.status = 'confirmed';
    expect(toMarkdown(brief)).toContain('`src/lib/sync.ts:48`');
    expect(toMarkdown(brief)).toContain('**Status:** Confirmed');
    expect(toJira(brief)).toContain('h2. Open questions');
  });
});
