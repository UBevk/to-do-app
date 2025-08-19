FROM node:20-alpine AS frontend-jajca

#frontend (/to-do-app)
WORKDIR /app/frontend
COPY to-do-app/package*.json ./
RUN npm ci

COPY to-do-app/ .
RUN npm run build

#backend (/backend)
FROM node:20-alpine AS backend-jajca
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY --from=frontend-jajca /app/frontend/dist ./public

#runtime
FROM node:20-alpine AS runner

#pa de ni glih root
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --from=backend-jajca /app/backend /app

ENV NODE_ENV=production
ENV PORT=3000

RUN chown -R app:app /app
USER app

EXPOSE 3000

CMD ["node", "index.js"]
