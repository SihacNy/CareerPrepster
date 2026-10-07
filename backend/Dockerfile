FROM node:22-slim AS base

# OpenSSL is pre-installed on Debian slim; install openssl CLI for Prisma detection
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests for workspace installation
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

RUN npm install --workspace=@careerprepster/shared --workspace=careerprepster-backend

# Copy and build shared library
COPY shared ./shared/
RUN npm run build --workspace=@careerprepster/shared

# Copy backend source code
COPY backend ./backend/

WORKDIR /app/backend
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npm run build --prefix /app --workspace=@careerprepster/shared && npx prisma db push && npx prisma db seed && npm run dev"]
