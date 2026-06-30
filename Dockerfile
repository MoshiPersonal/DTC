# Dolf Training Center — static site served by nginx.
# Build stage creates the distilled assets, then nginx serves them.
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json .
COPY .env .
COPY scripts ./scripts
COPY index.html .
COPY assets ./assets

RUN npm install
RUN npm run build

FROM nginx:stable-alpine

LABEL org.opencontainers.image.title="Dolf Training Center" \
      org.opencontainers.image.description="Bilingual (EN/AR) marketing website for Dolf Training Center" \
      org.opencontainers.image.source="https://dolftech.com"

# Replace the default server block with our config (gzip, caching, utf-8, security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built site output from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Container self-reports health via the /healthz endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost/healthz >/dev/null 2>&1 || exit 1

# nginx:alpine already runs `nginx -g 'daemon off;'` as its CMD
