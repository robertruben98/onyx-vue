import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function decideTag(version, previousVersion, commit, tagCommit) {
  if (tagCommit) return tagCommit === commit ? 'exists' : 'warn';
  return version === previousVersion ? 'unchanged' : 'create';
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

// Full history and tags must be fetched before running this script.
export function autoTag(sha) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error('Expected a full pushed commit SHA');
  const versionAt = ref => JSON.parse(git('show', `${ref}:package.json`)).version;
  const version = versionAt(sha);
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Invalid package version: ${version}`);
  }
  const parent = git('rev-list', '--parents', '-n', '1', sha).split(' ')[1];
  const previousVersion = parent ? versionAt(parent) : null;
  const tag = `v${version}`;
  const ref = `refs/tags/${tag}`;
  const lookup = spawnSync('git', ['show-ref', '--verify', '--quiet', ref]);
  if (lookup.status !== 0 && lookup.status !== 1) throw new Error('Unable to inspect existing tag');
  const tagCommit = lookup.status === 0 ? git('rev-parse', `${ref}^{commit}`) : null;
  const decision = decideTag(version, previousVersion, sha, tagCommit);
  if (decision === 'warn') {
    console.log(`::warning::${tag} already points to ${tagCommit}, not ${sha}; leaving it unchanged.`);
  }
  if (decision === 'create') {
    git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'tag', '-a', tag, '-m', `onyx-vue ${version}`, sha);
  }
  return { tag, created: decision === 'create' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { tag, created } = autoTag(process.argv[2]);
    const output = `tag=${tag}\ncreated=${created}\n`;
    process.stdout.write(output);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
