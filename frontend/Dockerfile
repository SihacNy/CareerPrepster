FROM node:22-alpine AS base

# Install libc compatibility for Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on package lockfile
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Environment setup
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]
