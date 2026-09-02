import type { Brief, Settings } from './types';

const SAMPLE_TRANSCRIPT = `We decided to keep the retry policy in src/lib/sync.ts and cap it at three attempts. Assume the API keeps returning Retry-After in seconds. We will add an idempotency key before the next release. Should we move the queue limit into config? Maya owns the follow-up.`;

export const sampleBrief = (): Brief => ({
  id: 'demo-retry-policy',
  title: 'Keep sync retries capped at three attempts',
  author: 'Maya Chen',
  createdAt: '2026-08-28T14:05:00.000Z',
  transcript: SAMPLE_TRANSCRIPT,
  decisions: ['Keep the retry policy capped at three attempts', 'Add an idempotency key before the next release'],
  assumptions: ['The API keeps returning Retry-After in seconds'],
  questions: ['Move the queue limit into config'],
  references: [
    { path: 'src/lib/sync.ts:48', note: 'Retry loop' },
    { path: 'src/config/limits.ts:12', note: 'Candidate queue setting' }
  ],
  status: 'draft'
});

export class LocalStore {
  recoveryNotice = '';
  constructor(public demo: boolean) {}
  private key(name: string) { return `${this.demo ? 'demo' : 'real'}:spoken-dev-brief:${name}`; }
  loadBrief(): Brief | null {
    const value = localStorage.getItem(this.key('brief'));
    if (!value && this.demo) { const sample = sampleBrief(); this.saveBrief(sample); return sample; }
    if (!value) return null;
    let brief: Brief;
    try {
      brief = JSON.parse(value) as Brief;
      if (!isBrief(brief)) throw new Error('Unsupported saved brief');
    } catch {
      localStorage.removeItem(this.key('brief'));
      this.recoveryNotice = 'A damaged saved brief was removed. Paste the transcript again to make a new brief.';
      return null;
    }
    const days = this.settings().retentionDays;
    if (days > 0 && Date.now() - new Date(brief.createdAt).getTime() > days * 86_400_000) { localStorage.removeItem(this.key('brief')); return null; }
    return brief;
  }
  saveBrief(brief: Brief) { localStorage.setItem(this.key('brief'), JSON.stringify(brief)); }
  settings(): Settings {
    const defaults: Settings = { author: '', retentionDays: 30, deleteAudioAfterTranscription: true };
    const value = localStorage.getItem(this.key('settings'));
    if (!value) return defaults;
    try {
      const parsed = JSON.parse(value) as Partial<Settings>;
      if (!parsed || typeof parsed !== 'object') throw new Error('Unsupported settings');
      return { ...defaults, ...parsed };
    } catch {
      localStorage.removeItem(this.key('settings'));
      this.recoveryNotice ||= 'Damaged settings were reset to their defaults.';
      return defaults;
    }
  }
  saveSettings(settings: Settings) { localStorage.setItem(this.key('settings'), JSON.stringify(settings)); }
  reset() {
    Object.keys(localStorage).filter(k => k.startsWith(this.demo ? 'demo:spoken-dev-brief:' : 'real:spoken-dev-brief:')).forEach(k => localStorage.removeItem(k));
  }
}

function isBrief(value: unknown): value is Brief {
  if (!value || typeof value !== 'object') return false;
  const brief = value as Partial<Brief>;
  return typeof brief.id === 'string'
    && typeof brief.title === 'string'
    && typeof brief.author === 'string'
    && typeof brief.createdAt === 'string'
    && !Number.isNaN(Date.parse(brief.createdAt))
    && typeof brief.transcript === 'string'
    && Array.isArray(brief.decisions)
    && brief.decisions.every(item => typeof item === 'string')
    && Array.isArray(brief.assumptions)
    && brief.assumptions.every(item => typeof item === 'string')
    && Array.isArray(brief.questions)
    && brief.questions.every(item => typeof item === 'string')
    && Array.isArray(brief.references)
    && brief.references.every(ref => ref && typeof ref.path === 'string' && typeof ref.note === 'string')
    && (brief.status === 'draft' || brief.status === 'confirmed');
}
