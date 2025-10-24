#!/bin/sh
# Simple Docker entrypoint script for reya-admin
# This script is included because the Dockerfile expects it.
# You can add custom startup logic here if needed.

set -e

# Default: start Next.js in production mode
exec "$@"
