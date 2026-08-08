import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import story from '../data/story.json' with { type: 'json' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 3000);
const staticRoot = path.join(root, 'public');
const previewMode = (process.env.PREVIEW_MODE || 'public').toLowerCase();
const previewUser = process.env.PREVIEW_USER || 'reviewer';
const previewPassword = process.env.PREVIEW_PASSWORD || '';

if (!['public', 'private'].includes(previewMode)) {
  throw new Error('PREVIEW_MODE must be either public or private');
}

if (previewMode === 'private' && !previewPassword) {
  throw new Error('PREVIEW_PASSWORD is required when PREVIEW_MODE=private');
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
  res.writeHead(401, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'www-authenticate': 'Basic realm="Byrock Story Explorer staging", charset="UTF-8"',
  });
  res.end('Authentication required');
}

function hasPreviewAccess(req) {
  if (previewMode !== 'private') return true;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  let decoded;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  const expectedUser = Buffer.from(previewUser);
  const expectedPassword = Buffer.from(previewPassword);
  const actualUser = Buffer.from(user);
  const actualPassword = Buffer.from(password);
  return actualUser.length === expectedUser.length
    && actualPassword.length === expectedPassword.length
    && timingSafeEqual(actualUser, expectedUser)
    && timingSafeEqual(actualPassword, expectedPassword);
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
    if (!hasPreviewAccess(req)) return unauthorized(res);
    if (url.pathname === '/health') return json(res, 200, { status: 'ok', service: 'byrock-story-explorer', contentMode: process.env.CONTENT_MODE || 'approved-only' });
    if (url.pathname === '/api/story') return json(res, 200, story);
    return serveStatic(res, url.pathname);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', message: error.message }));
    return json(res, 500, { error: 'Unable to load approved story content' });
  }
});

server.listen(port, () => console.log(`Byrock Story Explorer listening on http://localhost:${port}`));
