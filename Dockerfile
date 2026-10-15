# Multi-stage Dockerfile for Group Chat Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install all dependencies across workspaces
RUN npm install

# Copy source files
COPY . .

# Build client, server, and shared libraries
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors and install only production dependencies
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN npm install --omit=dev

# Copy compiled outputs
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/shared ./shared

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["node", "server/dist/server.js"]
