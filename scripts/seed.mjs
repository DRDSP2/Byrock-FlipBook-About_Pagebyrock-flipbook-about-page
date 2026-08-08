import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'data/story.json');
const story = JSON.parse(await readFile(target, 'utf8'));

await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(story, null, 2)}\n`);
console.log(`Seeded ${target}`);
