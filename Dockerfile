# Base image with Node.js LTS
FROM node:lts-slim AS base
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm@10

# Build stage
FROM base AS build
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm run build

# Dependencies stage (for production)
FROM base AS deps
RUN pnpm i --frozen-lockfile --prod

# Final image based on Distroless Node.js
FROM gcr.io/distroless/nodejs24-debian12:nonroot AS final
WORKDIR /app
COPY --from=base /app/package.json .
COPY --from=base /app/pnpm-lock.yaml .
COPY --from=build /app/build .
COPY --from=deps /app/node_modules ./node_modules

# Expose the application port and set the start command
EXPOSE 3000
CMD ["./index.js"]
