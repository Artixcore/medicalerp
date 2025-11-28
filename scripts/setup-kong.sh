#!/bin/bash

# Setup script for Kong API Gateway
# This script starts Kong in DB-less mode with declarative configuration

set -e

echo "Setting up Kong API Gateway..."

# Start Kong
echo "Starting Kong..."
docker-compose up -d kong

# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:8001/status > /dev/null 2>&1; then
    echo "Kong is ready!"
    break
  fi
  echo "Waiting for Kong... ($attempt/$max_attempts)"
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo "Error: Kong failed to start"
  docker logs ehrms-kong
  exit 1
fi

echo ""
echo "Kong API Gateway is ready!"
echo ""
echo "Access points:"
echo "  Kong Proxy:      http://localhost:8000"
echo "  Kong Admin API:  http://localhost:8001"
echo "  Kong Admin GUI:  http://localhost:8002"
echo ""
echo "Test Kong status:"
echo "  curl http://localhost:8001/status"
echo ""
echo "Test API through gateway:"
echo "  curl http://localhost:8000/api/v1/auth/login -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"test\"}'"

