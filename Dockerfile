# Frontend Dockerfile for Confluence Vite / React Platform
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
