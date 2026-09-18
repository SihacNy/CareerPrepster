FROM node:22-alpine AS base

# Install OpenSSL and libc compatibility for Alpine Linux
RUN apk add --no-cache openssl libc6-compat

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

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run dev"]
