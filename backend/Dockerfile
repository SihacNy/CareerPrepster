FROM node:20-alpine AS base

# Install OpenSSL and libc compatibility for Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run dev"]
