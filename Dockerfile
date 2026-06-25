# ============================================================
# Atlas Frontend — build de produção
# Stage 1: compila os estáticos com Node/Vite
# Stage 2: serve com Nginx
# ============================================================

# ── Stage 1: build ──────────────────────────────────────────
FROM node:22.13.0-alpine AS build

WORKDIR /app

# Instala dependências a partir do lockfile (reprodutível)
COPY package.json package-lock.json ./
RUN npm ci

# Variáveis VITE_* são embutidas em build-time (Vite inlinea
# import.meta.env.VITE_*). Por padrão a API é relativa (/api),
# já que o Nginx gateway serve front e back no mesmo domínio.
ARG VITE_API_URL=/api
ARG VITE_ENV_NAME=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV_NAME=$VITE_ENV_NAME

COPY . .
RUN npm run build

# ── Stage 2: runtime ────────────────────────────────────────
FROM nginx:alpine

# Config de SPA (fallback para index.html nas rotas do client-side)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estáticos gerados no stage de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
