import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('static response policy', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));

  it('rewrites only real application routes and serves unknown paths as 404', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes.filter((route: { rewrite?: string }) => route.rewrite).map((route: { route: string }) => route.route)).toEqual(['/app', '/demo', '/privacy', '/terms']);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('gives versioned assets immutable caching while revalidating the app shell', () => {
    expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
    expect(config.routes).toContainEqual({ route: '/index.html', headers: { 'Cache-Control': 'no-cache' } });
    expect(readFileSync('src/main.ts', 'utf8')).not.toMatch(/\/assets\/(?:hero|walkthrough|social-card)-(?:768-|1536-)?[a-z]+\.webp/);
  });

  it('has exactly one tagged regression test for every declared claim', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string }>;
    const testSources = [
      readFileSync('tests/claims.spec.ts', 'utf8'),
      readFileSync('src-tauri/src/lib.rs', 'utf8'),
    ].join('\n');
    for (const { id } of claims) {
      expect(testSources.match(new RegExp(`@claim:${id}\\b`, 'g'))?.length, id).toBe(1);
    }
  });
});
