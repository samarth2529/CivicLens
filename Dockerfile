# syntax=docker/dockerfile:1
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code (secrets & .env excluded via .dockerignore)
COPY . .

# Build frontend production bundle into /app/dist
RUN npm run build

# Cloud Run defaults to port 8080
EXPOSE 8080

# Start server using tsx
CMD ["npm", "start"]
