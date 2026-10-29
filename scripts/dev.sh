#!/usr/bin/env bash
set -e

# Kill any existing process on port 5000 to prevent port collisions
fuser -k 5000/tcp 2>/dev/null || pkill -f "python3 app.py" 2>/dev/null || true

# Start Flask backend server in background
python3 app.py &
PYTHON_PID=$!

# Cleanup backend process when Vite exits or receives SIGINT/SIGTERM
cleanup() {
  echo "Shutting down AutoAudit-360 backend (PID $PYTHON_PID)..."
  kill $PYTHON_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start Vite dev server on port 3000
exec vite --port=3000 --host=0.0.0.0
