# Multi-stage production Dockerfile for CareerPrepster Next.js Frontend
FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy root workspace manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

# Install workspace dependencies
RUN npm ci

# Copy shared library & frontend source code
COPY shared ./shared
COPY frontend ./frontend

# Build shared package first
RUN npm run build --prefix /app --workspace=@careerprepster/shared

WORKDIR /app/frontend

# Environment setup
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_IGNORE_INCORRECT_LOCKFILE=1

# Pre-compile the production bundle ahead-of-time
RUN npm run build

EXPOSE 3000

# Run production server
CMD ["npm", "run", "start"]
