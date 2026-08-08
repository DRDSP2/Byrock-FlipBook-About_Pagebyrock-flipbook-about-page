import { createServer } from 'node:http';
import story from "../data/story.json" with { type: "json" };
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 3000);
const storyPath = path.resolve(root, process.env.STORY_DATA_PATH || './data/story.json');
const staticRoot = path.join(root, 'public');

function readStory() {
  return story;
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function serveStatic(res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(staticRoot, `.${requested}`);
  if (!filePath.startsWith(staticRoot)) return json(res, 403, { error: 'Forbidden' });
  try {
    const content = await readFile(filePath);
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'content-type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    json(res, 404, { error: 'Not found' });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/health') return json(res, 200, { status: 'ok', service: 'byrock-story-explorer', contentMode: process.env.CONTENT_MODE || 'approved-only' });
    if (url.pathname === '/api/story') return json(res, 200, await readStory());
    return serveStatic(res, url.pathname);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', message: error.message }));
    return json(res, 500, { error: 'Unable to load approved story content' });
  }
});

server.listen(port, () => console.log(`Byrock Story Explorer listening on http://localhost:${port}`));
