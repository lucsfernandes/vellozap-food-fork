# syntax=docker/dockerfile:1.7

############################
# Stage 1 — Builder
############################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html postcss.config.js tailwind.config.ts components.json ./
COPY public ./public
COPY src ./src

# Build-time API base URL — Vite inlines `import.meta.env.VITE_API_URL` into the
# bundle, so this MUST be provided at build time (CI passes --build-arg). The
# SPA runs in the browser and calls the backend on its OWN public host.
ARG VITE_API_URL="http://localhost:3333/api"
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

############################
# Stage 2 — Runtime (Nginx)
############################
FROM nginx:1.27-alpine AS runtime

# Drop the default vhost and ship our SPA-aware config instead
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# Run as a non-root user. Alpine's nginx image ships a "nginx" user (uid 101).
# Listen on 8080 so we don't need CAP_NET_BIND_SERVICE for ports < 1024.
# Matches the Deployment securityContext (runAsUser: 101, readOnlyRootFilesystem).
RUN sed -i 's/user  nginx;/# user nginx;/' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx \
    && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
