# ── Stage 1: Build Vite ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Build arg para la URL del API en producción
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve con Nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Eliminar config default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Usuario nginx ya existe, no necesitamos crear uno
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
