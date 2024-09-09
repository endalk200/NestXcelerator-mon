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

CMD [ "node", "./dist/main.js" ]
