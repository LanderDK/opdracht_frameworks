#!/bin/sh
set -e

# Seed the database
echo "Seeding database..."
npm run seed_docker

# Start the app
echo "Starting app..."
npm run start
