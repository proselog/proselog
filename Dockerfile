##### BASE
FROM node:16-bullseye-slim as base

# install open ssl for prisma
RUN apt-get update && apt-get install -y openssl

RUN npm i -g pnpm

##### BUILD
FROM base as build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV BUILD_STEP=1
RUN pnpm build

##### FINAL
FROM base

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/.next/standalone /app
COPY --from=build /app/public /app/public
COPY --from=build /app/.next/static /app/.next/static

CMD ["pnpm", "start"]
