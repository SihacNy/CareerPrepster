FROM node:22-slim AS base

WORKDIR /app

# Copy package manifests for workspace installation
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

RUN npm install --workspace=@careerprepster/shared --workspace=careerprepster-frontend && \
    npm install --workspace=careerprepster-frontend @next/swc-linux-x64-gnu@14.2.21

# Copy and build shared library
COPY shared ./shared/
RUN npm run build --workspace=@careerprepster/shared

# Copy frontend source code
COPY frontend ./frontend/

WORKDIR /app/frontend

# Environment setup
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_IGNORE_INCORRECT_LOCKFILE=1

EXPOSE 3000

CMD ["sh", "-c", "[ -d node_modules/@next/swc-linux-x64-gnu ] || [ -d ../node_modules/@next/swc-linux-x64-gnu ] || npm install --no-save @next/swc-linux-x64-gnu@14.2.21; npm run dev"]
