#!/bin/bash
# Quick-start script for Mac/Linux
# Run from inside the image-enhancer/ folder

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        PIXLIFT — Image Enhancer      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Install Python deps
echo "▶ Installing Python dependencies..."
pip3 install -r model/requirements.txt --quiet

# Install backend deps
echo "▶ Installing backend dependencies..."
(cd backend && npm install --silent)

# Install frontend deps
echo "▶ Installing frontend dependencies..."
(cd frontend && npm install --silent)

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Starting servers..."
echo ""

# Start backend in background
(cd backend && node server.js) &
BACKEND_PID=$!

# Start frontend
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "🚀 Backend  → http://localhost:5000"
echo "🌐 Frontend → http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
