# -----------------------------------------------------------------------------
# SatExpert Tactical SatCom Intelligence (TSI)
# Production Container for Google Cloud Run / Google Cloud Deployment
# -----------------------------------------------------------------------------

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Compile TypeScript and build production bundle
RUN npm run build

# Stage 2: Production Nginx Server with Cloud Run $PORT dynamic binding
FROM nginx:alpine

# Copy nginx template supporting dynamic $PORT from Cloud Run
COPY <<'EOF' /etc/nginx/templates/default.conf.template
server {
    listen ${PORT};
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Error handling
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Default Cloud Run port
ENV PORT=8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
