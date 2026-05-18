# syntax=docker/dockerfile:1

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* .npmrc ./
RUN npm ci --ignore-scripts

COPY . .

RUN npx prisma generate
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* .npmrc ./
RUN npm ci --ignore-scripts --omit=dev

COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && npx react-router-serve ./build/server/index.js"]
