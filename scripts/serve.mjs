import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const requested = path.join(projectRoot, pathname === '/' ? 'index.html' : pathname);
  if (!requested.startsWith(projectRoot)) {
    return null;
  }
  return requested;
}

async function sendFile(filePath, response) {
  const info = await stat(filePath);
  const target = info.isDirectory() ? path.join(filePath, 'index.html') : filePath;
  const body = await readFile(target);
  response.writeHead(200, {
    'Content-Type': mimeTypes[path.extname(target)] || 'application/octet-stream'
  });
  response.end(body);
}

http
  .createServer(async (request, response) => {
    const filePath = resolveRequestPath(request.url);
    if (filePath === null) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    try {
      await sendFile(filePath, response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
    }
  })
  .listen(port, () => {
    console.log(`Mini React 教学版已启动：http://localhost:${port}`);
  });
