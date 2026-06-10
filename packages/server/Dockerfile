FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @outer-rim/shared build
RUN pnpm --filter @outer-rim/server build
EXPOSE 2567
CMD ["node", "packages/server/dist/index.js"]
