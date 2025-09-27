#!/usr/bin/env bash
set -e

# Run Deno lint
lint() { cd backend && deno lint --unstable-kv --config=deno.json .; }

# Run tests
test() { cd backend && deno task test --config=deno.json .; }

# Run backend
backend() { cd backend && deno task dev --config=deno.json .; }

# Format code
fmt() { cd backend && deno fmt --check .; }

case "$1" in
  lint) lint ;;
  test) test ;;
  fmt) fmt ;;
  backend) backend ;;
  *) echo "Usage: $0 {lint|fmt|test|backend}" ;;
esac
