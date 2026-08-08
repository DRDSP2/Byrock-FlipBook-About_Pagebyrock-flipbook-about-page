import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import story from '../data/story.json' with { type: 'json' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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

function unauthorized(res) {
  res.statusCode = 401;
  res.setHeader('cache-control', 'no-store');
  res.setHeader('www-authenticate', 'Basic realm="Byrock Story Explorer staging", charset="UTF-8"');
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
  const user = Buffer.from(decoded.slice(0, separator));
  const password = Buffer.from(decoded.slice(separator + 1));
  const expectedUser = Buffer.from(previewUser);
  const expectedPassword = Buffer.from(previewPassword);
  return user.length === expectedUser.length
    && password.length === expectedPassword.length
    && timingSafeEqual(user, expectedUser)
    && timingSafeEqual(password, expectedPassword);
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function serveStatic(res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(staticRoot, `.${requested}`);
  if (!filePath.startsWith(staticRoot)) return json(res, 403, { error: 'Forbidden' });
  try {
    const content = await readFile(filePath);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.svg': 'image/svg+xml',
    };
    res.statusCode = 200;
    res.setHeader('content-type', types[path.extname(filePath)] || 'application/octet-stream');
    res.end(content);
  } catch {
    json(res, 404, { error: 'Not found' });
  }
}

export default async function handler(req, res) {
  if (!hasPreviewAccess(req)) return unauthorized(res);
  const url = new URL(req.url || '/', `https://${req.headers.host || 'preview.local'}`);
  const route = url.searchParams.get('route') || url.pathname;
  if (route === '/health' || route === 'health') return json(res, 200, { status: 'ok', service: 'byrock-story-explorer', contentMode: 'approved-only' });
  if (route === '/api/story' || route === 'story') return json(res, 200, story);
  return serveStatic(res, url.searchParams.get('path') || route);
}
