#!/usr/bin/env bash
set -e

# Run Deno lint
lint() { cd backend && deno lint --unstable-kv --config=deno.json .; }

# Run tests
test() { cd backend && deno task test --config=deno.json .; }

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
  *) echo "Usage: $0 {lint|fmt|test|backend|backend_watch|frontend|fullstack|fullstack_watch}" ;;
esac
