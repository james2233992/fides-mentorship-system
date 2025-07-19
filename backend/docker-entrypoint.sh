#!/bin/sh
set -e

echo "Starting FIDES Backend..."

# Run database migrations if DATABASE_URL is set
if [ ! -z "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Migrations completed."
fi

# Execute the main command
exec "$@"