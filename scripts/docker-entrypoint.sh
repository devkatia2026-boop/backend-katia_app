#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS_ON_START:-false}" = "true" ]; then
  export ENVIRONMENT="${ENVIRONMENT:-local}"
  env_lower=$(echo "$ENVIRONMENT" | tr '[:upper:]' '[:lower:]')
  if [ "$env_lower" = "local" ] || [ "$env_lower" = "development" ]; then
    NODE_ENV=development npm run db:migrate --silent
  else
    NODE_ENV=production npm run db:migrate --silent
  fi
fi

exec node dist/main.js
