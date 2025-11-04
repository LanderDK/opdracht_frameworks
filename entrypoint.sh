#!/bin/sh
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
until nc -z -v -w30 $DATABASE_HOST $DATABASE_PORT
do
  echo "Waiting for database connection..."
  sleep 2
done

# Seed the database
echo "Seeding database..."
npm run seed

# Start the app
echo "Starting app..."
npm run start
