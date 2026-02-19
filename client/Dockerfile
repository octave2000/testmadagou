FROM node:20-bookworm-slim
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "npm run build && npm run start -- -H 0.0.0.0 -p 3000"]
