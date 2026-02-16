# --- Builder stage ---
FROM node:20 AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app source
COPY . /app

# Build the frontend
RUN npm run build

# --- Deployer stage ---
FROM nginx:stable-alpine AS deployer

RUN apk add --no-cache wget

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (optional, for redirects)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
