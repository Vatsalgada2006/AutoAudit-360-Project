import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FLASK_PORT = 5000;

let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  console.log('[server] Starting Python Flask engine on port ' + FLASK_PORT + '...');
  pythonProcess = spawn('python3', ['app.py'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(FLASK_PORT),
      PYTHONUNBUFFERED: '1',
    },
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[server] Python backend exited with code ${code} signal ${signal}`);
    pythonProcess = null;
  });

  pythonProcess.on('error', (err) => {
    console.error('[server] Failed to spawn Python backend:', err);
  });
}

const shutdown = () => {
  console.log('[server] Shutting down...');
  if (pythonProcess) {
    try {
      pythonProcess.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

async function ensureFlaskRunning() {
  try {
    const res = await fetch(`http://127.0.0.1:${FLASK_PORT}/api/health`, { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      console.log('[server] Flask backend already active on port ' + FLASK_PORT);
      return;
    }
  } catch {
    // not running yet
  }
  startPythonBackend();
}

// Reverse proxy for /api/* to Flask on port 5000
app.use('/api', (req, res) => {
  const targetUrl = new URL(`http://127.0.0.1:${FLASK_PORT}${req.originalUrl}`);
  const proxyReq = http.request(
    targetUrl,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${FLASK_PORT}`,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    console.error('[server] Proxy error communicating with Flask:', err.message);
    if (!res.headersSent) {
      res.status(503).json({
        error: 'AutoAudit-360 Python engine is initializing, please retry momentarily.',
        detail: err.message,
      });
    }
  });

  req.pipe(proxyReq);
});

async function startServer() {
  await ensureFlaskRunning();

  const distPath = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[server] Running with Vite dev middleware');
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[server] Serving static production bundle from ' + distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] AutoAudit-360 full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[server] Fatal server error:', err);
  process.exit(1);
});
