#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations for Catalog Service..."
bunx drizzle-kit push || echo "Migration warning (might be idempotent)"

echo "Seeding catalog data..."
bun run src/db/seed.ts || echo "Seeding warning (data might already exist)"

echo "Starting Catalog Service..."
exec bun run src/index.ts
