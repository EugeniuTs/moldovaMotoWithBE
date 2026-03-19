# ─────────────────────────────────────────────
# Stage 1 – dependencies (shared by both targets)
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# npm install works without a pre-existing lockfile.
# Layer is cached as long as package.json is unchanged.
RUN npm install

# ─────────────────────────────────────────────
# Stage 2 – development  (hot-reload via Vite)
#
#   docker compose up --build
#   -> http://localhost:3000
# ─────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Source is bind-mounted at runtime (see docker-compose.yml volumes).
# Copying here only serves standalone docker build --target dev use.
COPY . .
EXPOSE 3000
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]

# ─────────────────────────────────────────────
# Stage 3 – builder  (Vite production build)
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx vite build

# ─────────────────────────────────────────────
# Stage 4 – production  (Nginx serving dist/)
#
#   docker compose --profile prod up --build
#   -> http://localhost:80
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS prod
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
