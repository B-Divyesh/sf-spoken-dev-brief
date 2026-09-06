import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('packaged transcription model integrity', () => {
  it('rejects a model whose bytes do not match the pinned package checksum', () => {
    const directory = mkdtempSync(join(tmpdir(), 'spoken-dev-brief-model-'));
    const replacement = join(directory, 'ggml-tiny.en.bin');
    writeFileSync(replacement, 'not the Whisper model');
    try {
      let failure: { stderr?: string } | undefined;
      try {
        execFileSync('sh', ['scripts/verify-whisper-model.sh'], {
          env: { ...process.env, MODEL_PATH: replacement },
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error) {
        failure = error as { stderr?: string };
      }
      expect(failure).toBeDefined();
      expect(failure?.stderr).toContain('checksum does not match');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
