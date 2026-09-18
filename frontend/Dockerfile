FROM node:22-alpine AS base

# Install libc compatibility for Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package manifests for workspace installation
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

RUN npm install --workspace=@careerprepster/shared --workspace=careerprepster-frontend

# Copy and build shared library
COPY shared ./shared/
RUN npm run build --workspace=@careerprepster/shared

# Copy frontend source code
COPY frontend ./frontend/

WORKDIR /app/frontend

# Environment setup
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]
