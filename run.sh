#!/usr/bin/env bash
set -e

# Experimental: Run frontend tests, killing only Deno backend server on port 8087
test_frontend_experimental() {
  kill_backend

  # Start backend in test mode (run in background)
  cd backend || exit
  deno run --allow-net --allow-read --allow-write --unstable-kv startTestServer.ts &
  backend_pid=$!
  cd ..

  # Wait briefly to ensure backend is up
  sleep 1

  # Run frontend tests
  cd frontend || exit
  npm run test
  test_result=$?
  cd ..

  kill_backend
  echo "Finished frontend tests."
  exit $test_result
}


# Run frontend tests with backend in test mode
test_frontend() {
  if server_status; then
    echo "Error: Backend server is already running. Stop it before running frontend tests." >&2
    exit 1
  fi

  # Start backend in test mode (run in background)
  cd backend
  deno run --allow-net --allow-read --allow-write --unstable-kv startTestServer.ts &
  backend_pid=$!
  cd ..

  # Wait briefly to ensure backend is up
  sleep 1

  # Run frontend tests
  cd frontend
  npm run test
  test_result=$?
  cd ..

  echo "NOTE: Backend test server (PID $backend_pid) is still running. Please stop it manually if needed."
  exit $test_result
}

# Run Deno lint
lint() { cd backend && deno lint --unstable-kv --config=deno.json .; }

# Run tests for backend
test_backend() { cd backend && deno task test --config=deno.json .; }

# Run tests for both backend and frontend
test() { 
  echo "Running backend tests..."
  test_backend
  cd ..
  sleep 1
  echo "Running frontend tests..."
  test_frontend_experimental; }

# Run backend
backend() { cd backend && deno task dev --config=deno.json .; }

# Run backend with --watch
backend_watch() { cd backend && deno task dev --watch --config=deno.json .; }

# Run frontend
frontend() { cd frontend && npm run dev; }

# Run backend and frontend concurrently
fullstack() { backend & frontend; wait; }

# Run backend and frontend concurrently with backend in watch mode
fullstack_watch() { backend_watch & frontend; wait; }

# Check if backend server is running on port 8087
server_status() {
  local port=8087
  if lsof -ti tcp:$port >/dev/null; then
    echo "Backend server is running on port $port."
    return 0
  else
    echo "Backend server is NOT running on port $port."
    return 1
  fi
}

# kill backend server if running
kill_backend() {
  local port=8087
  if lsof -ti tcp:$port >/dev/null; then
    echo "Stopping backend server running on port $port..."
    lsof -ti tcp:$port | xargs -r ps -p | grep deno | awk '{print $1}' | xargs -r kill
    echo "Backend server stopped."
  else
    echo "No backend server running on port $port."
  fi
}

# Format code
fmt() { cd backend && deno fmt --check .; }

case "$1" in
  lint) lint ;;
  test) test ;;
  fmt) fmt ;;
  backend) backend ;;
  backend_watch) backend_watch ;;
  frontend) frontend ;;
  fullstack) fullstack ;;
  fullstack_watch) fullstack_watch ;;
  server_status) server_status ;;
  test_backend) test_backend ;;
  test_frontend) test_frontend ;;
  test_frontend_experimental) test_frontend_experimental ;;
  kill_backend) kill_backend ;;
  *) echo "Usage: $0 {lint|fmt|test|test_backend|backend|backend_watch|frontend|fullstack|fullstack_watch|server_status|test_frontend|kill_backend|test_frontend_experimental}" ;;
esac
