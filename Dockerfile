FROM node:22.8-bookworm-slim AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22.8-bookworm-slim AS production

ARG user=appuser
ARG group=${user}
ARG uid=1001
ARG gid=$uid

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

RUN groupadd --gid ${gid} ${user}
RUN useradd --uid ${uid} --gid ${gid} -m ${user}

COPY --from=base /app/package.json ./package.json
COPY --from=base /app/package-lock.json ./package-lock.json
COPY --from=base /app/dist ./dist
COPY --from=base /app/openapi ./openapi
COPY --from=base /app/prisma ./prisma

RUN chown -R ${uid}:${gid} /app/

RUN npm ci --only=production

RUN npx prisma generate

USER ${user}

ENV PORT=3000
EXPOSE ${PORT}

# --interval=30s: Checks every 30 seconds.
# --timeout=5s: Times out after 5 seconds if no response.
# --start-period=5s: Waits 5 seconds before starting checks.
# --retries=3: Retries 3 times before marking the container as unhealthy.
# CMD curl --fail http://localhost:${PORT}/api/health || exit 1: 
#       Executes a curl command to check the health endpoint. If the command fails, it exits with a non-zero status, marking the container as unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:${PORT}/api/health || exit 1

CMD [ "node", "./dist/main.js" ]
