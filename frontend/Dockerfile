# syntax=docker/dockerfile:1.7
#
# OpsHub frontend image. Targets:
#   dev  — Vite dev server with HMR; source bind-mounted by docker-compose.yml.
#   prod — static build served by nginx, which also proxies /api to Django.

FROM node:22-slim AS base
ARG PNPM_VERSION=12.3.4
ENV CI=true
RUN npm install --global --no-fund --no-audit pnpm@${PNPM_VERSION}
WORKDIR /app

# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
FROM deps AS dev
COPY . .
EXPOSE 5174
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5174", "--strictPort"]

# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .
# VITE_* values are baked into the bundle at build time.
ARG VITE_USE_MOCKS=false
ARG VITE_API_BASE_URL=
ARG VITE_DEMO_PASSWORD=opshub-demo
ENV VITE_USE_MOCKS=${VITE_USE_MOCKS} \
    VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_DEMO_PASSWORD=${VITE_DEMO_PASSWORD} \
    VITE_ENABLE_QUERY_DEVTOOLS=false
RUN pnpm build

# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS prod
# Rendered by the nginx image's envsubst step at start-up.
ENV API_UPSTREAM=http://api:8000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1
