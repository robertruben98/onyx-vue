import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const script = resolve('scripts/auto-tag.mjs');
const directories = [];
afterEach(() => directories.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));
function repository() {
  const cwd = mkdtempSync(join(tmpdir(), 'auto-tag-'));
  directories.push(cwd);
  const git = (...args) => {
    const result = spawnSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', ...args], { cwd, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr);
    return result.stdout.trim();
  };
  git('init', '--initial-branch=master');
  const commit = version => {
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ version }));
    git('add', 'package.json');
    git('commit', '--allow-empty', '-m', version);
    return git('rev-parse', 'HEAD');
  };
  const run = sha => spawnSync(process.execPath, [script, sha], { cwd, encoding: 'utf8' });
  return { cwd, git, commit, run };
}

describe('automatic release tags', () => {
  it.each([
    [null, 'create'], ['pushed', 'exists'], ['older', 'warn'],
  ])('decides safely when the tag target is %s', async (target, expected) => {
    const { decideTag } = await import(/* @vite-ignore */ pathToFileURL(script).href);
    expect(decideTag('1.1.0', '1.0.0', 'pushed', target)).toBe(expected);
    expect(decideTag('1.1.0', '1.1.0', 'pushed', null)).toBe('unchanged');
  });
  it('creates an annotated missing tag on the pushed version-bump commit, even if HEAD differs', () => {
    const { git, commit, run } = repository();
    commit('1.0.0');
    const pushed = commit('1.1.0');
    commit('1.2.0');
    const result = run(pushed);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('created=true');
    expect(git('cat-file', '-t', 'v1.1.0')).toBe('tag');
    expect(git('rev-parse', 'v1.1.0^{}')).toBe(pushed);
  });
  it('does not tag an unchanged version even when its tag is missing', () => {
    const { git, commit, run } = repository();
    commit('1.0.0');
    const result = run(commit('1.0.0'));
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('created=false');
    expect(git('tag', '--list')).toBe('');
  });
  it.each(['here', 'elsewhere'])('never moves an existing annotated tag %s', where => {
    const { git, commit, run } = repository();
    const previous = commit('1.0.0');
    const pushed = commit('1.1.0');
    git('tag', '-a', 'v1.1.0', '-m', 'Existing', where === 'here' ? pushed : previous);
    const original = git('rev-parse', 'v1.1.0');
    const result = run(pushed);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('created=false');
    expect(git('rev-parse', 'v1.1.0')).toBe(original);
    expect(result.stdout.includes('::warning::')).toBe(where === 'elsewhere');
  });
  // jsdom cannot run GitHub Actions or authenticate to the Releases API.
  // Real local Git tests above verify tagging; this contract verifies the reusable job wiring.
  it('pushes master tags and explicitly calls the asset workflow with the created tag', () => {
    const workflow = readFileSync('.github/workflows/auto-tag.yml', 'utf8');
    const release = readFileSync('.github/workflows/release.yml', 'utf8');
    expect(workflow).toContain('branches: [master]');
    expect(workflow).toContain('fetch-depth: 0');
    expect(workflow).toContain('node scripts/auto-tag.mjs "$PUSHED_SHA"');
    expect(workflow).toContain('git push origin "refs/tags/$TAG:refs/tags/$TAG"');
    expect(workflow).not.toContain('--force');
    expect(workflow).toContain("if: needs.tag.outputs.created == 'true'");
    expect(workflow).toContain('uses: ./.github/workflows/release.yml');
    expect(workflow).toContain('tag: ${{ needs.tag.outputs.tag }}');
    expect(release).toContain('workflow_call:');
    expect(release).toContain('ref: ${{ inputs.tag || github.ref }}');
    expect(release).toContain('TAG: ${{ inputs.tag || github.ref_name }}');
    expect(release).toContain('gh release upload');
  });
});
