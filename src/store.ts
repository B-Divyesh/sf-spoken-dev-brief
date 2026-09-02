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
  constructor(public demo: boolean) {}
  private key(name: string) { return `${this.demo ? 'demo' : 'real'}:spoken-dev-brief:${name}`; }
  loadBrief(): Brief | null {
    const value = localStorage.getItem(this.key('brief'));
    if (!value && this.demo) { const sample = sampleBrief(); this.saveBrief(sample); return sample; }
    if (!value) return null;
    const brief = JSON.parse(value) as Brief;
    const days = this.settings().retentionDays;
    if (days > 0 && Date.now() - new Date(brief.createdAt).getTime() > days * 86_400_000) { localStorage.removeItem(this.key('brief')); return null; }
    return brief;
  }
  saveBrief(brief: Brief) { localStorage.setItem(this.key('brief'), JSON.stringify(brief)); }
  settings(): Settings {
    const defaults: Settings = { author: '', retentionDays: 30, deleteAudioAfterTranscription: true };
    const value = localStorage.getItem(this.key('settings'));
    return value ? { ...defaults, ...JSON.parse(value) } : defaults;
  }
  saveSettings(settings: Settings) { localStorage.setItem(this.key('settings'), JSON.stringify(settings)); }
  reset() {
    Object.keys(localStorage).filter(k => k.startsWith(this.demo ? 'demo:spoken-dev-brief:' : 'real:spoken-dev-brief:')).forEach(k => localStorage.removeItem(k));
  }
}
