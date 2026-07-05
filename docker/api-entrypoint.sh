#!/bin/sh
set -e

echo "Running database migrations..."
node dist/db/migrate.js

echo "Starting Adalah API..."
exec node dist/server.js
