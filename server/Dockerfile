FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Build the TypeScript app and keep only production dependencies.
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3002
CMD ["node", "dist/src/index.js"]
