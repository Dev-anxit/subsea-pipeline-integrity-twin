#!/bin/bash
# ==============================================================================
# DeepGuard: Real-Time Subsea Pipeline Integrity Management
# Team Mind Spark - Production Startup Script
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "======================================================================"
echo " Starting DeepGuard Subsea Integrity Digital Twin (Team Mind Spark)"
echo "======================================================================"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn websockets pandas numpy scipy pydantic python-multipart pytest
fi

# Ensure frontend dependencies installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "Starting FastAPI Backend Server on port 8000..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Vite Frontend Development Server on port 5173..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd ..

cleanup() {
    echo ""
    echo "Stopping DeepGuard servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

echo ""
echo "======================================================================"
echo " DeepGuard is LIVE & READY FOR EVALUATION:"
echo " -> Frontend Dashboard : http://localhost:5173"
echo " -> FastAPI Backend    : http://localhost:8000"
echo " -> Interactive Docs   : http://localhost:8000/docs"
echo " -> WebSocket Stream   : ws://localhost:8000/ws/telemetry"
echo "======================================================================"
echo "Press CTRL+C to terminate both servers."

wait

