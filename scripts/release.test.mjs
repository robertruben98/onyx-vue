import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// jsdom cannot execute GitHub's tag trigger or authenticated Releases API.
// Check the workflow contract here; exercise the actual preflight CLI in Node.
describe('tagged release', () => {
  it('runs the tag pipeline with scoped permissions and pinned actions', () => {
    const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
    expect(workflow).toContain("tags: ['v*.*.*']");
    expect(workflow).toMatch(/^permissions: \{\}$/m);
    expect(workflow).toMatch(/    permissions:\n      contents: write/);
    const actions = [...workflow.matchAll(/uses: (\S+)/g)].map(match => match[1]);
    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) expect(action).toMatch(/@[a-f0-9]{40}$/);
    const commands = ['node scripts/release.mjs', 'npm ci', 'npm run typecheck', 'npm test', 'npm run build', 'npm pack'];
    let previous = -1;
    for (const command of commands) {
      const position = workflow.indexOf(command);
      expect(position).toBeGreaterThan(previous);
      previous = position;
    }
    expect(workflow).toContain('ref: ${{ inputs.tag || github.ref }}');
    expect(workflow).toContain('GH_TOKEN: ${{ github.token }}');
    expect(workflow).toContain('gh release create');
    expect(workflow).toContain('gh release edit');
    expect(workflow).toContain('gh release upload');
    expect(workflow).toContain('--clobber');
    expect(workflow).toContain('--notes-file');
  });

  it('fails the real preflight before packing when the version differs', () => {
    const result = spawnSync(process.execPath, ['scripts/release.mjs', 'v999.0.0'], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not match package.json version');
    expect(result.stdout).toBe('');
  });

  it('extracts only the exact matching changelog section, including subsections', async () => {
    const { extractReleaseNotes } = await import(/* @vite-ignore */ pathToFileURL(resolve('scripts/release.mjs')).href);
    const changelog = '# Changelog\r\n\r\n## Unreleased\r\nFuture\r\n## 1.2.30 — 2026-01-01\r\nOther\r\n## 1.2.3 — 2025-12-01\r\n\r\n### Fixed\r\n\r\n- Bug fixed.\r\n\r\n## 1.2.2\r\nOlder\r\n';
    expect(extractReleaseNotes(changelog, '1.2.3')).toBe('### Fixed\n\n- Bug fixed.\n');
    expect(extractReleaseNotes('## 1.2.3\nLast section\n', '1.2.3')).toBe('Last section\n');
    expect(() => extractReleaseNotes(changelog, '2.0.0')).toThrow('Missing CHANGELOG section');
    expect(() => extractReleaseNotes('## 1.2.3\n\n## Older\n', '1.2.3')).toThrow('Empty CHANGELOG section');
  });

  it('successfully dry-runs the current tag and prints its notes', () => {
    const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
    const result = spawnSync(process.execPath, ['scripts/release.mjs', `v${version}`], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    // Any release section has at least one `### Added|Changed|Fixed…` heading;
    // naming one would break the first release that lacks it.
    expect(result.stdout).toMatch(/^### \S/m);
    expect(result.stdout).not.toContain('## Consuming');
    expect(result.stdout).not.toContain('## Unreleased');
  });

  it('documents the release asset install URL in the consuming section', () => {
    const consuming = readFileSync('CHANGELOG.md', 'utf8').split('## Consuming a tagged version')[1];
    expect(consuming).toContain('https://github.com/robertruben98/onyx-vue/releases/download/vX.Y.Z/onyx-vue-X.Y.Z.tgz');
    expect(consuming).toMatch(/npm install https:\/\/github.com\/robertruben98\/onyx-vue\/releases\/download\/v/);
  });
});
