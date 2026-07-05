#!/bin/sh
set -e

echo "Waiting for database..."
node wait-for-db.mjs

echo "Running database migrations..."
node dist/db/migrate.js

echo "Starting Adalah API..."
exec node dist/server.js
