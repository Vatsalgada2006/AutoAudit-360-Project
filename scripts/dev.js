import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getPythonBinary() {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  const isWin = process.platform === 'win32';
  const venvPy = isWin
    ? path.join(rootDir, '.venv', 'Scripts', 'python.exe')
    : path.join(rootDir, '.venv', 'bin', 'python');
  if (fs.existsSync(venvPy)) return venvPy;
  return isWin ? 'python' : 'python3';
}

const pyBin = getPythonBinary();
console.log(`[dev] Starting Python Flask backend using '${pyBin}' on port 5000...`);

const pyProc = spawn(pyBin, ['app.py'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000',
    PYTHONUNBUFFERED: '1',
  },
});

pyProc.on('error', (err) => {
  console.error('[dev] Failed to spawn Python backend:', err.message);
});

// Start Vite dev server directly via node
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const viteProc = spawn(process.execPath, [viteBin, '--port=3000', '--host=0.0.0.0'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: process.env,
});

const cleanup = () => {
  console.log('[dev] Shutting down Python backend and Vite...');
  try {
    if (pyProc && !pyProc.killed) {
      if (isWin) {
        spawn('taskkill', ['/pid', String(pyProc.pid), '/f', '/t']);
      } else {
        pyProc.kill('SIGTERM');
      }
    }
  } catch {}
  try {
    if (viteProc && !viteProc.killed) {
      if (isWin) {
        spawn('taskkill', ['/pid', String(viteProc.pid), '/f', '/t']);
      } else {
        viteProc.kill('SIGTERM');
      }
    }
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

viteProc.on('exit', (code) => {
  cleanup();
});
