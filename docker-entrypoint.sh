#!/bin/sh
set -e

# Ensure persistent directories exist
mkdir -p /app/data
mkdir -p /app/uploads

# Note: Permission fixing (chown) is sometimes needed on certain hosts,
# but for Node.js slim images running as root/node it might be automatic.
# In rodetesparty (PHP/Apache) it was critical for www-data.

# We just ensure they exist so the app doesn't crash on start
echo "Nixxy Toxic: Initializing storage..."

# Execute the CMD from Dockerfile
exec "$@"
