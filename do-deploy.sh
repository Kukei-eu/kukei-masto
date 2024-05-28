#!/bin/bash

# Build Docker images
docker compose build

# Stop and remove containers
docker compose down

# Start containers in detached mode
docker compose up -d
