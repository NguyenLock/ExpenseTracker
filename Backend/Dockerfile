# Build context is the repository root (npm workspaces + root package-lock.json).
#   docker build -f Backend/Dockerfile .
# Render: dockerContext ".", dockerfilePath "./Backend/Dockerfile".
# Backend/.dockerignore is NOT read for this context. The root .dockerignore is.
# A Backend/-only context cannot `npm ci` this workspace, so do not use it.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY Frontend/package.json ./Frontend/package.json
COPY Backend/package.json ./Backend/package.json
RUN npm ci
COPY Backend ./Backend
# Empty dir so the production COPY still works when npm hoists everything to /app/node_modules.
RUN mkdir -p Backend/node_modules \
  && npm run build -w @expense-tracker/api \
  && npm prune --omit=dev

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/Backend/package.json ./Backend/package.json
COPY --from=build /app/Backend/node_modules ./Backend/node_modules
COPY --from=build /app/Backend/dist ./Backend/dist
WORKDIR /app/Backend
EXPOSE 3001
# Render free cannot use preDeployCommand. Migrate once per boot, then listen.
# ponytail: safe for the single free-tier instance. Use a pre-deploy command if you leave the free plan and run more than one instance.
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/main.js"]
