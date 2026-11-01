# -----------------------------------------------------------------------------
# SatExpert Tactical SatCom Intelligence (TSI)
# Production Container for Google Cloud Run / Google Cloud Deployment
# -----------------------------------------------------------------------------

# Stage 1: Build static assets and prepare dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json .npmrc ./
RUN npm ci --strict-peer-deps

# Copy source files
COPY . .

# Compile TypeScript and build production bundle
RUN npm run build

# Stage 2: Production Node.js Server for full-stack Express + WebSocket + Static Asset delivery
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package configuration, node_modules, dist, and server source from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Expose default Cloud Run port
EXPOSE 8080

# Start server.ts which runs Express API, WebSockets, and static file serving
CMD ["npm", "start"]

