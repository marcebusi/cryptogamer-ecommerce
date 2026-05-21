# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de build
COPY package*.json ./
RUN npm ci

# Copiar fuentes y compilar TypeScript
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Generar cliente Prisma y compilar
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Crear usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar artefactos del build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Directorio para uploads locales (si no se usa Cloudinary)
RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

# Cambiar a usuario no-root
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

# Corre las migraciones pendientes antes de arrancar el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
