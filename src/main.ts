import './style.css';
import { draftBrief, toJira, toMarkdown } from './brief';
import { LocalStore } from './store';
import type { Brief, Settings } from './types';
import { cachedLicensed, captureLicense, checkoutUrl, saveLicense, verifyLicense } from './license';

declare global { interface Window { __TAURI_INTERNALS__?: unknown } }

const app = document.querySelector<HTMLDivElement>('#app')!;
let recorder: LocalRecorder | null = null;
let flash = '';
const siteOrigin = 'https://spoken-dev-brief.sociobot.in';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]!));
const route = () => location.pathname.replace(/\/$/, '') || '/';
const isDemo = () => route() === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const store = () => new LocalStore(isDemo());

function focusRouteHeading(scrollX = 0, scrollY = 0) {
  requestAnimationFrame(() => {
    scrollTo(scrollX, scrollY);
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  });
}

function navigate(path: string) {
  history.replaceState({ ...history.state, scrollX, scrollY }, '');
  history.pushState({ scrollX: 0, scrollY: 0 }, '', path);
  render();
  const hash = new URL(location.href).hash;
  if (hash) requestAnimationFrame(() => document.querySelector<HTMLElement>(hash)?.scrollIntoView());
  focusRouteHeading();
}

function shell(content: string, title: string, description: string) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', new URL(route(), siteOrigin).href);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', new URL(route(), siteOrigin).href);
  return `
    <header class="site-header">
      <nav class="nav-wrap" aria-label="Main navigation">
        <a class="wordmark route-link" href="/" aria-label="Spoken Dev Brief home"><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span><span>Spoken Dev Brief</span></a>
        <div class="nav-links"><a class="route-link" href="/demo">Demo</a><a href="/#how">How it works</a><a class="route-link" href="/privacy">Privacy</a></div>
      </nav>
    </header>
    ${isDemo() ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : ''}
    <main id="main">${content}</main>
    <div class="sr-only" aria-live="polite" id="route-status"></div>
    <div class="toast ${flash ? 'is-visible' : ''}" role="status">${escapeHtml(flash)}</div>
    <footer><div><a class="wordmark route-link" href="/">Spoken Dev Brief</a><p>Confirmed engineering decisions from spoken work.</p></div><div class="footer-links"><a class="route-link" href="/privacy">Privacy</a><a class="route-link" href="/terms">Terms</a><a href="https://hello-factory.sociobot.in" rel="noreferrer">Built by Param Factory <span class="sr-only">(external)</span></a><span>v0.1.1</span></div><p class="generated-note">Poster artwork was generated for this product.</p></footer>`;
}

function landing() {
  return shell(`
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Local-first desktop recorder</p>
        <h1 tabindex="-1">Turn spoken decisions into engineering briefs</h1>
        <p class="lede">For distributed product teams who need implementation talk linked to code and confirmed by a person.</p>
        <div class="hero-actions"><a class="button primary route-link" href="/demo">Try it with sample data</a><span>Opens a filled brief you can review and export.</span></div>
        <ul class="plain-facts"><li>Audio stays on your device.</li><li>Works without an account.</li><li>Free core tools. Pro costs $12/user/month.</li></ul>
      </div>
      <figure class="hero-art"><picture><source type="image/webp" srcset="/assets/hero-768-15251fb1.webp 768w, /assets/hero-1536-25417cfa.webp 1536w" sizes="(max-width: 760px) 100vw, 48vw"><img src="/assets/hero-1536-25417cfa.webp" width="1536" height="1024" alt="A microphone waveform becomes rails leading to an engineering brief." fetchpriority="high" decoding="async"></picture><figcaption>A spoken discussion becomes a confirmed record.</figcaption></figure>
    </section>
    <section class="live-preview" aria-labelledby="preview-heading">
      <div class="section-heading"><p class="eyebrow">A finished brief</p><h2 id="preview-heading">Review the draft before exporting</h2><p>The draft separates decisions, assumptions, questions, and repository paths.</p></div>
      <article class="paper-preview"><div class="preview-meta"><span>Draft 04</span><span>Owner: Maya Chen</span></div><h3>Keep sync retries capped at three attempts</h3><dl><div><dt>Decision</dt><dd>Keep the retry policy capped at three attempts.</dd></div><div><dt>Assumption</dt><dd>The API returns Retry-After in seconds.</dd></div><div><dt>Code</dt><dd><code>src/lib/sync.ts:48</code></dd></div></dl><span class="stamp">Needs confirmation</span></article>
    </section>
    <section class="how" id="how" aria-labelledby="how-title"><div class="section-heading"><p class="eyebrow">How it works</p><h2 id="how-title">Create a checked record in three steps</h2></div><ol class="route-steps"><li><span>01</span><h3>Record with consent</h3><p>Mark consent, then capture only the implementation discussion you need.</p><figure><img src="/assets/walkthrough-capture-b52b5880.webp" width="390" height="777" loading="lazy" decoding="async" alt="The capture panel with consent, recording, and transcript controls."><figcaption>Capture only after consent.</figcaption></figure></li><li><span>02</span><h3>Review the draft</h3><p>Edit decisions, assumptions, questions, owners, and repository paths.</p><figure><img src="/assets/walkthrough-review-3bd032b9.webp" width="700" height="650" loading="lazy" decoding="async" alt="A draft brief with editable decisions and an owner."><figcaption>Every item stays editable.</figcaption></figure></li><li><span>03</span><h3>Confirm and export</h3><p>Confirm the record, then download Markdown or copy Jira text.</p><figure><img src="/assets/walkthrough-export-58746b77.webp" width="700" height="500" loading="lazy" decoding="async" alt="A confirmed brief with Markdown and Jira export buttons."><figcaption>Export only after review.</figcaption></figure></li></ol></section>
    <section class="privacy-block" aria-labelledby="privacy-title"><div><p class="eyebrow">Clear limits</p><h2 id="privacy-title">A recorder, not a meeting bot</h2></div><ul><li>It does not join calls or record in secret.</li><li>It does not score people or create HR analytics.</li><li>It does not write code or approve its own draft.</li><li>Your speech and code are not used for model training.</li></ul></section>
    <section class="pricing" aria-labelledby="pricing-title"><div><p class="eyebrow">Pro plan</p><h2 id="pricing-title">Private transcription for ongoing team work</h2><p>Free includes manual transcripts, review, repository links, and export.</p></div><div class="fare"><p><strong>$12</strong> / user / month</p><ul><li>Packaged local transcription model</li><li>Manual transcript workflow stays free</li><li>Restore an existing license</li></ul><a class="button primary unavailable" href="${checkoutUrl}" aria-disabled="true" aria-describedby="checkout-note" data-action="checkout-unavailable">Checkout unavailable</a><button class="text-button" data-action="show-license">Have a license? Paste it</button><p class="fine" id="checkout-note">Purchase registration is pending. Existing licenses can still be verified.</p><form class="license-form" hidden><label for="license-token">License token</label><div><input id="license-token" autocomplete="off"><button class="button secondary" type="submit">Verify license</button></div></form><p class="fine">Sociobot will be the merchant of record. See <a class="route-link" href="/terms">terms</a>.</p></div></section>
    <section class="download" aria-labelledby="download-title"><div><p class="eyebrow">Desktop app</p><h2 id="download-title">Install on your computer</h2><p id="platform-note">Checking the latest desktop package…</p><p class="install-commands"><code>curl -fsSL https://spoken-dev-brief.sociobot.in/install.sh | sh</code><code>irm https://spoken-dev-brief.sociobot.in/install.ps1 | iex</code></p></div><a class="button secondary" id="download-link" href="https://github.com/B-Divyesh/sf-spoken-dev-brief/releases">View releases</a><p class="fine">Current v1 packages are unsigned. Your operating system may ask you to confirm.</p></section>
  `, 'Spoken Dev Brief — Turn speech into code-linked briefs', 'Record implementation talk, confirm each decision, and export a code-linked engineering brief without sending audio away.');
}

function appView() {
  const s = store();
  const brief = s.loadBrief();
  const settings = s.settings();
  return shell(`
    ${s.recoveryNotice ? `<p class="recovery-notice" role="alert">${escapeHtml(s.recoveryNotice)}</p>` : ''}
    <section class="workspace-head"><div><p class="eyebrow">Decision workspace</p><h1 tabindex="-1">Review a spoken engineering brief</h1><p>${isDemo() ? 'This sample uses a realistic sync-policy discussion.' : 'Record locally or paste a transcript to start.'}</p></div><ol class="stage-rail" aria-label="Workflow"><li class="done">Capture</li><li class="current">Draft</li><li>Confirm</li><li>Export</li></ol></section>
    <section class="workspace-grid">
      <aside class="capture-panel" aria-labelledby="capture-title">
        <h2 id="capture-title">Capture speech</h2>
        <div class="consent-box"><span class="consent-lamp" aria-hidden="true"></span><label><input id="consent" type="checkbox"> Everyone present has agreed to this recording.</label></div>
        <button class="record-button" data-action="record" ${isDemo() ? 'disabled' : ''}><span aria-hidden="true"></span>${isDemo() ? 'Recording off in demo' : 'Start recording'}</button>
        <p class="status-line" id="record-status">${window.__TAURI_INTERNALS__ ? 'Local transcription is ready in the desktop app.' : 'Paste a transcript here. Recording works in the desktop app.'}</p>
        <label for="transcript">Transcript</label><textarea id="transcript" rows="10" placeholder="Paste the words you want to turn into a brief.">${escapeHtml(brief?.transcript || '')}</textarea>
        <button class="button secondary full" data-action="draft">Draft brief locally</button>
        <p class="fine">Only the words in this box are used for the draft.</p>
      </aside>
      <section class="brief-editor" aria-labelledby="brief-title">
        ${brief ? briefEditor(brief) : `<div class="empty-state"><div class="empty-lines" aria-hidden="true"></div><h2 id="brief-title">No brief yet</h2><p>Record speech or paste a transcript. A draft will appear here.</p><button class="button secondary" data-action="focus-transcript">Add a transcript</button></div>`}
      </section>
    </section>
    <details class="settings-panel"><summary>Storage and transcription settings</summary>${settingsForm(settings)}</details>
  `, `${isDemo() ? 'Demo' : 'App'} — Spoken Dev Brief`, 'Review, confirm, and export a code-linked engineering decision brief.');
}

function briefEditor(brief: Brief) {
  const list = (kind: 'decisions' | 'assumptions' | 'questions', label: string) => `<fieldset><legend>${label}</legend>${brief[kind].map((item, i) => `<div class="editable-row"><textarea rows="2" data-field="${kind}" data-index="${i}" aria-label="${label} ${i + 1}">${escapeHtml(item)}</textarea><button class="icon-button" data-action="remove-item" data-field="${kind}" data-index="${i}" aria-label="Remove ${label.toLowerCase()} ${i + 1}">×</button></div>`).join('')}<button class="text-button" data-action="add-item" data-field="${kind}">+ Add ${label.toLowerCase()}</button></fieldset>`;
  return `<h2 class="sr-only" id="brief-title">Edit the brief</h2><div class="brief-toolbar"><span class="status-badge ${brief.status}">${brief.status === 'confirmed' ? 'Confirmed' : 'Needs confirmation'}</span><span>Saved on this device</span></div>
    <label for="brief-name">Brief title</label><input class="title-input" id="brief-name" value="${escapeHtml(brief.title)}">
    <div class="author-row"><label for="author">Owner</label><input id="author" value="${escapeHtml(brief.author)}"></div>
    ${list('decisions', 'Decisions')}${list('assumptions', 'Assumptions')}${list('questions', 'Open questions')}
    <fieldset><legend>Repository references</legend>${brief.references.map((ref, i) => `<div class="ref-row"><input data-ref="path" data-index="${i}" value="${escapeHtml(ref.path)}" aria-label="Repository path ${i + 1}"><input data-ref="note" data-index="${i}" value="${escapeHtml(ref.note)}" aria-label="Repository note ${i + 1}"><button class="icon-button" data-action="remove-ref" data-index="${i}" aria-label="Remove repository reference ${i + 1}">×</button></div>`).join('')}<button class="text-button" data-action="add-ref">+ Add repository path</button></fieldset>
    <div class="confirm-row"><label><input type="checkbox" id="reviewed" ${brief.status === 'confirmed' ? 'checked disabled' : ''}> I checked this brief against the recording.</label><button class="button primary" data-action="confirm" ${brief.status === 'confirmed' ? 'disabled' : ''}>Confirm brief</button></div>
    <p class="export-help" id="export-help">${brief.status === 'confirmed' ? 'This confirmed brief is ready to export.' : 'Confirm this brief before exporting it.'}</p>
    <div class="export-row"><button class="button secondary" data-action="markdown" aria-describedby="export-help" ${brief.status === 'confirmed' ? '' : 'disabled'}>Download Markdown</button><button class="button secondary" data-action="jira" aria-describedby="export-help" ${brief.status === 'confirmed' ? '' : 'disabled'}>Copy Jira text</button></div>`;
}

function settingsForm(settings: Settings) {
  return `<form id="settings-form" class="settings-form"><div><label for="default-author">Default owner</label><input id="default-author" name="author" value="${escapeHtml(settings.author)}"></div><div><label for="retention">Delete saved briefs after</label><select id="retention" name="retentionDays"><option value="7" ${settings.retentionDays === 7 ? 'selected' : ''}>7 days</option><option value="30" ${settings.retentionDays === 30 ? 'selected' : ''}>30 days</option><option value="90" ${settings.retentionDays === 90 ? 'selected' : ''}>90 days</option><option value="0" ${settings.retentionDays === 0 ? 'selected' : ''}>Never</option></select></div><label class="check"><input name="deleteAudio" type="checkbox" ${settings.deleteAudioAfterTranscription ? 'checked' : ''}> Delete audio after local transcription</label><button class="button secondary" type="submit">Save settings</button><button class="text-button danger-link" type="button" data-action="delete-data">Delete all local data</button></form>`;
}

function policyPage(kind: 'privacy' | 'terms') {
  const privacy = `<section class="legal"><p class="eyebrow">Policy</p><h1 tabindex="-1">Privacy in plain words</h1><p class="updated">Effective 2 September 2026</p><h2>Your device holds your work</h2><p>Recordings, transcripts, briefs, settings, and license tokens stay in app storage on your device.</p><h2>Local transcription</h2><p>The desktop app transcribes audio with its packaged model. It does not upload audio for local transcription.</p><h2>Model training</h2><p>Your speech and code are not sent for model training.</p><h2>Payments</h2><p>Sociobot and Dodo handle checkout, billing details, and refunds. This app stores only your license token and its last verification result.</p><h2>Delete your data</h2><p>Use Storage settings to set retention or delete local data immediately.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p></section>`;
  const terms = `<section class="legal"><p class="eyebrow">Agreement</p><h1 tabindex="-1">Terms of use</h1><p class="updated">Effective 2 September 2026</p><h2>Use recordings with consent</h2><p>You must have permission from everyone recorded. Do not use the app for covert recording.</p><h2>Review every brief</h2><p>Drafts can be wrong. A person must check a brief before relying on it.</p><h2>Free and Pro</h2><p>Core review and export tools are free. Pro is listed at $12 per user each month.</p><p>New purchases are unavailable until checkout registration is complete.</p><h2>Billing and refunds</h2><p>Sociobot and Dodo will handle checkout, billing, and refunds after registration. A refunded or expired license stops Pro access.</p><h2>Warranty</h2><p>The software is provided as-is under the MIT license. Keep backups of records you need.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for help.</p></section>`;
  return shell(kind === 'privacy' ? privacy : terms, `${kind === 'privacy' ? 'Privacy' : 'Terms'} — Spoken Dev Brief`, kind === 'privacy' ? 'How Spoken Dev Brief stores recordings, transcripts, licenses, and optional online requests.' : 'Terms for recording consent, brief review, billing, and use of Spoken Dev Brief.');
}

function notFound() {
  return shell(`<section class="not-found"><div class="deco-404" aria-hidden="true">404</div><h1 tabindex="-1">This route ends here</h1><p>The page may have moved or the address may be wrong.</p><a class="button primary route-link" href="/">Return home</a></section>`, 'Page not found — Spoken Dev Brief', 'This Spoken Dev Brief page could not be found.');
}

function render() {
  flash = '';
  const path = route();
  app.innerHTML = path === '/' ? landing() : path === '/demo' || path === '/app' ? appView() : path === '/privacy' ? policyPage('privacy') : path === '/terms' ? policyPage('terms') : notFound();
  bindEvents();
  requestAnimationFrame(() => { const status = document.querySelector('#route-status'); if (status) status.textContent = document.title; });
  if (path === '/') void resolveDownload();
}

function saveEditor(): Brief | null {
  const s = store(); const brief = s.loadBrief(); if (!brief) return null;
  const before = JSON.stringify({ title: brief.title, author: brief.author, decisions: brief.decisions, assumptions: brief.assumptions, questions: brief.questions, references: brief.references });
  brief.title = (document.querySelector<HTMLInputElement>('#brief-name')?.value || brief.title).trim();
  brief.author = (document.querySelector<HTMLInputElement>('#author')?.value || brief.author).trim();
  document.querySelectorAll<HTMLTextAreaElement>('[data-field]').forEach(el => { const key = el.dataset.field as 'decisions' | 'assumptions' | 'questions'; brief[key][Number(el.dataset.index)] = el.value.trim(); });
  document.querySelectorAll<HTMLInputElement>('[data-ref]').forEach(el => { const key = el.dataset.ref as 'path' | 'note'; brief.references[Number(el.dataset.index)][key] = el.value.trim(); });
  const after = JSON.stringify({ title: brief.title, author: brief.author, decisions: brief.decisions, assumptions: brief.assumptions, questions: brief.questions, references: brief.references });
  if (brief.status === 'confirmed' && before !== after) {
    brief.status = 'draft';
    delete brief.confirmedAt;
  }
  s.saveBrief(brief); return brief;
}

function notify(message: string) { flash = message; const toast = document.querySelector('.toast'); if (toast) { toast.textContent = message; toast.classList.add('is-visible'); setTimeout(() => toast.classList.remove('is-visible'), 2800); } }

function bindEvents() {
  document.querySelectorAll<HTMLAnchorElement>('a.route-link').forEach(link => link.addEventListener('click', e => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); navigate(new URL(link.href).pathname + new URL(link.href).hash); } }));
  document.querySelector('.license-form')?.addEventListener('submit', async e => { e.preventDefault(); const token = document.querySelector<HTMLInputElement>('#license-token')!.value; saveLicense(token); notify(await verifyLicense() ? 'License verified. Pro is active.' : 'That license is not active. Check the token and try again.'); });
  document.querySelector('#settings-form')?.addEventListener('submit', e => { e.preventDefault(); const form = e.currentTarget as HTMLFormElement; const fd = new FormData(form); store().saveSettings({ author: String(fd.get('author') || ''), retentionDays: Number(fd.get('retentionDays')), deleteAudioAfterTranscription: fd.get('deleteAudio') === 'on' }); notify('Settings saved on this device.'); });
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.brief-editor input, .brief-editor textarea').forEach(el => el.addEventListener('change', () => {
    const before = store().loadBrief()?.status;
    const saved = saveEditor();
    if (before === 'confirmed' && saved?.status === 'draft') { render(); notify('The brief changed. Confirm it again before exporting.'); }
  }));
  document.querySelector<HTMLElement>('[data-action="checkout-unavailable"]')?.addEventListener('click', event => event.preventDefault());
  document.querySelectorAll<HTMLElement>('[data-action]').forEach(el => el.addEventListener('click', () => void handleAction(el.dataset.action!, el)));
}

async function handleAction(action: string, el: HTMLElement) {
  const s = store();
  if (action === 'reset-demo') { s.reset(); render(); notify('Demo reset to the sample brief.'); }
  if (action === 'start-real') { s.reset(); navigate('/app'); }
  if (action === 'show-license') { document.querySelector<HTMLFormElement>('.license-form')!.hidden = false; document.querySelector<HTMLInputElement>('#license-token')!.focus(); }
  if (action === 'checkout-unavailable') notify('Checkout is not available yet. Purchase registration is pending.');
  if (action === 'focus-transcript') document.querySelector<HTMLTextAreaElement>('#transcript')?.focus();
  if (action === 'draft') { const transcript = document.querySelector<HTMLTextAreaElement>('#transcript')!.value.trim(); if (!transcript) { notify('No transcript was found. Paste some spoken words, then try again.'); return; } s.saveBrief(draftBrief(transcript, s.settings().author || 'Unassigned')); render(); notify('Draft created. Review each item before confirming.'); }
  if (action === 'add-item') { const b = saveEditor(); if (!b) return; b[el.dataset.field as 'decisions' | 'assumptions' | 'questions'].push(''); s.saveBrief(b); render(); }
  if (action === 'remove-item') { const b = saveEditor(); if (!b) return; b[el.dataset.field as 'decisions' | 'assumptions' | 'questions'].splice(Number(el.dataset.index), 1); s.saveBrief(b); render(); }
  if (action === 'add-ref') { const b = saveEditor(); if (!b) return; b.references.push({ path: '', note: '' }); s.saveBrief(b); render(); }
  if (action === 'remove-ref') { const b = saveEditor(); if (!b) return; b.references.splice(Number(el.dataset.index), 1); s.saveBrief(b); render(); }
  if (action === 'confirm') { const reviewed = document.querySelector<HTMLInputElement>('#reviewed')!; if (!reviewed.checked) { notify('Confirmation is still unchecked. Review the brief, then check the box.'); reviewed.focus(); return; } const b = saveEditor(); if (!b) return; b.status = 'confirmed'; b.confirmedAt = new Date().toISOString(); s.saveBrief(b); render(); notify('Brief confirmed. It is ready to export.'); }
  if (action === 'markdown') { const b = saveEditor(); if (!b || b.status !== 'confirmed') { render(); notify('Confirm the brief before downloading Markdown.'); return; } downloadText(`${slugify(b.title)}.md`, toMarkdown(b), 'text/markdown'); notify('Markdown brief downloaded.'); }
  if (action === 'jira') { const b = saveEditor(); if (!b || b.status !== 'confirmed') { render(); notify('Confirm the brief before copying Jira text.'); return; } await navigator.clipboard.writeText(toJira(b)); notify('Jira text copied.'); }
  if (action === 'delete-data') { if (confirm('Delete all briefs and settings stored by this mode? This cannot be undone.')) { s.reset(); render(); notify('Local data deleted.'); } }
  if (action === 'record') await toggleRecording();
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'engineering-brief';
function downloadText(name: string, content: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

class LocalRecorder {
  private context!: AudioContext; private stream!: MediaStream; private source!: MediaStreamAudioSourceNode; private processor!: ScriptProcessorNode; private chunks: Float32Array[] = [];
  async start() { this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true } }); this.context = new AudioContext({ sampleRate: 16000 }); this.source = this.context.createMediaStreamSource(this.stream); this.processor = this.context.createScriptProcessor(4096, 1, 1); this.processor.onaudioprocess = e => this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0))); this.source.connect(this.processor); this.processor.connect(this.context.destination); }
  async stop(): Promise<number[]> { this.processor.disconnect(); this.source.disconnect(); this.stream.getTracks().forEach(t => t.stop()); const rate = this.context.sampleRate; await this.context.close(); const total = this.chunks.reduce((n, x) => n + x.length, 0); const samples = new Float32Array(total); let at = 0; this.chunks.forEach(x => { samples.set(x, at); at += x.length; }); return [...encodeWav(samples, rate)]; }
}

function encodeWav(samples: Float32Array, rate: number) { const out = new Uint8Array(44 + samples.length * 2); const view = new DataView(out.buffer); const text = (n: number, v: string) => [...v].forEach((c, i) => view.setUint8(n + i, c.charCodeAt(0))); text(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); text(8, 'WAVEfmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, samples.length * 2, true); samples.forEach((s, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true)); return out; }

async function toggleRecording() {
  const button = document.querySelector<HTMLButtonElement>('[data-action="record"]')!; const status = document.querySelector('#record-status')!;
  if (!recorder) {
    if (!document.querySelector<HTMLInputElement>('#consent')!.checked) { notify('Consent is not marked. Ask everyone, then check the consent box.'); return; }
    if (!window.__TAURI_INTERNALS__) { notify('Microphone transcription runs in the installed desktop app. Paste a transcript in this browser.'); return; }
    if (!cachedLicensed() && !await verifyLicense()) { notify('Local transcription needs Pro. Paste a transcript for free or add your license from the home page.'); return; }
    try { recorder = new LocalRecorder(); await recorder.start(); button.classList.add('recording'); button.innerHTML = '<span aria-hidden="true"></span>Stop and transcribe'; status.textContent = 'Recording on this device. Stop when the decision is complete.'; } catch { recorder = null; notify('The microphone could not start. Allow microphone access, then try again.'); }
  } else {
    button.disabled = true; status.textContent = 'Transcribing on this device…';
    try { const wav = await recorder.stop(); recorder = null; const { invoke } = await import('@tauri-apps/api/core'); const transcript = await invoke<string>('transcribe_wav', { wavBytes: wav }); document.querySelector<HTMLTextAreaElement>('#transcript')!.value = transcript; status.textContent = 'Local transcription complete. Review the words before drafting.'; button.disabled = false; button.classList.remove('recording'); button.innerHTML = '<span aria-hidden="true"></span>Start recording'; } catch { recorder = null; button.disabled = false; status.textContent = 'Transcription stopped. Paste a transcript or check the local model installation.'; notify('Local transcription did not finish. Check the model, then try again.'); }
  }
}

async function resolveDownload() {
  const note = document.querySelector('#platform-note'); const link = document.querySelector<HTMLAnchorElement>('#download-link'); if (!note || !link) return;
  let release: { at: number; data: any } | null = null;
  try { const cached = localStorage.getItem('release:spoken-dev-brief'); release = cached ? JSON.parse(cached) : null; } catch { localStorage.removeItem('release:spoken-dev-brief'); }
  try { if (!release || Date.now() - release.at > 3_600_000) { const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-spoken-dev-brief/releases?per_page=1'); if (!response.ok) throw new Error(); const releases = await response.json() as any[]; if (!releases[0]) { note.textContent = 'Downloads are being published. Open Releases to check again.'; return; } release = { at: Date.now(), data: releases[0] }; localStorage.setItem('release:spoken-dev-brief', JSON.stringify(release)); }
    const platform = /Win/i.test(navigator.userAgent) ? 'windows' : /Mac/i.test(navigator.userAgent) ? 'macOS' : 'Linux'; const pattern = platform === 'windows' ? /\.(msi|exe)$/i : platform === 'macOS' ? /\.(dmg|app\.tar\.gz)$/i : /\.(AppImage|deb)$/i; const asset = release.data.assets?.find((x: any) => pattern.test(x.name)); note.textContent = asset ? `Latest package for ${platform}: ${asset.name}` : `Downloads for ${platform} are being published.`; if (asset) { link.href = asset.browser_download_url; link.textContent = `Download for ${platform}`; }
  } catch { note.textContent = 'Downloads are being published. Open Releases to check again.'; }
}

captureLicense();
if (import.meta.env.MODE === 'desktop' && route() === '/') history.replaceState({}, '', '/app');
history.scrollRestoration = 'manual';
history.replaceState({ ...history.state, scrollX: scrollX, scrollY: scrollY }, '');
window.addEventListener('popstate', event => {
  render();
  const state = event.state as { scrollX?: number; scrollY?: number } | null;
  focusRouteHeading(state?.scrollX || 0, state?.scrollY || 0);
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && route() === '/app') { e.preventDefault(); void handleAction('draft', document.body); } });
render();
if (cachedLicensed()) void verifyLicense();
if ('serviceWorker' in navigator && !window.__TAURI_INTERNALS__) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
