# ── Stage 1: Builder ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (layer caching)
COPY package*.json ./

# Install all deps including devDependencies for testing
RUN npm ci

# Copy source
COPY . .

# ── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS production

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source from builder
COPY --from=builder /app/index.js ./

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose app port
EXPOSE 3000

# Health check built into the image
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
