#!/bin/bash

echo "🚀 Starting Voice Journal App..."

# Kill any existing processes on ports 5176 and 5177
pkill -f "proxy-server.js" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
lsof -ti:5176 | xargs kill -9 2>/dev/null || true
lsof -ti:5177 | xargs kill -9 2>/dev/null || true

sleep 2

# Start Vite dev server on port 5177
echo "📦 Starting Vite dev server on port 5177..."
npm run dev &
VITE_PID=$!

# Wait for Vite to start
sleep 5

# Start proxy server on port 5176
echo "🌐 Starting proxy server on port 5176..."
node proxy-server.js &
PROXY_PID=$!

# Wait for proxy to start
sleep 2

echo ""
echo "✅ Voice Journal App is ready!"
echo "📍 URL: http://localhost:5176/journal"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $VITE_PID 2>/dev/null || true
    kill $PROXY_PID 2>/dev/null || true
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep script running
wait