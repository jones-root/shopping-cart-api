# Build
FROM node:22-slim AS builder

WORKDIR /usr/app
# Copy package*.json to cache `npm install` in future builds
COPY package*.json ./
# Install all dependencies (including development dependencies) to compile and build the /dist
RUN npm install
COPY . .
RUN npm run build

# Runtime
FROM node:22-slim
WORKDIR /usr/app
# Copy package*.json to cache `npm install` in future builds
COPY package*.json ./
# Install only production dependencies for the final build making the node_modules smaller
RUN npm install --omit=dev
COPY . .

COPY --from=builder /usr/app/dist ./dist

EXPOSE 3001

# Create .env from .env.template if .env does not exist already
RUN [ ! -f .env ] && cp .env.template .env || true

ENV TZ UTC

# Start app
CMD npm run start
