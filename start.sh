#!/usr/bin/env bash

# Use working Node.js binary
export PATH="/usr/local/bin:$PATH"

# Navigate to project directory
cd "$(dirname "$0")"

echo "=================================================="
echo "  🚀 Starting XOR Collaborative Editor..."
echo "  Frontend: http://localhost:5173"
echo "  Lobby:    http://localhost:5173/Collaborate"
echo "  Backend:  http://localhost:5001"
echo "=================================================="

npm run dev
