#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations for Notification Service..."
bunx drizzle-kit push || echo "Migration warning (might be idempotent)"

echo "Starting Notification Service..."
exec bun run src/index.ts
