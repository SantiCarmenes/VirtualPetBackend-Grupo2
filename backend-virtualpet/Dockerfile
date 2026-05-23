# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Prisma client generado en el build stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# App compilada
COPY --from=builder /app/dist ./dist

# Schema y migraciones para prisma migrate deploy en runtime
COPY src/prisma/schema.prisma ./prisma/schema.prisma
COPY src/prisma/migrations ./prisma/migrations

# Config de Prisma para producción (rutas apuntando a ./prisma/)
COPY prisma.config.prod.ts ./prisma.config.ts

EXPOSE 8080

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
