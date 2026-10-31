import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function extractReleaseNotes(changelog, version) {
  const lines = changelog.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex(line => line.match(/^##\s+(\S+)/)?.[1] === version);
  if (start === -1) throw new Error(`Missing CHANGELOG section for ${version}`);
  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end++;
  const notes = lines.slice(start + 1, end).join('\n').trim();
  if (!notes) throw new Error(`Empty CHANGELOG section for ${version}`);
  return `${notes}\n`;
}

// Run from the repository root; stdout is suitable for --notes-file.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const tag = process.argv[2];
    const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
    if (tag !== `v${version}`) {
      throw new Error(`Tag ${tag ?? '(missing)'} does not match package.json version ${version}`);
    }
    process.stdout.write(extractReleaseNotes(readFileSync('CHANGELOG.md', 'utf8'), version));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
