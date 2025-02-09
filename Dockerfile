# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Add package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Run security audit
RUN npm audit

# Stage 2: Production
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy configuration files
COPY .env.example .env
COPY tsconfig.json .
COPY jest.config.js .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Set security-related environment variables with defaults
ENV RATE_LIMIT_WINDOW_MS=900000
ENV RATE_LIMIT_MAX=100
ENV SESSION_COOKIE_SECURE=true
ENV STRICT_SECURITY_HEADERS=true

# Create necessary directories with proper permissions
RUN mkdir -p logs && \
    chown -R appuser:appgroup logs && \
    chmod 755 logs

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "dist/server.js"]

# Security-related labels
LABEL maintainer="lovingthemoo@gmail.com" \
      version="1.0.0" \
      description="Basic RESTful API with security features" \
      security.updates="enabled" \
      security.scanning="enabled"

# Best practices
# 1. Multi-stage build to minimize image size
# 2. Non-root user for security
# 3. Production dependencies only
# 4. Health check implementation
# 5. Proper permissions
# 6. Environment configuration
# 7. Security labels
# 8. npm audit during build