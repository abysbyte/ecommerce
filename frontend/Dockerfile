# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy the root package.json and the frontend code
# Since we are building from the root context (or passing it individually), we will just build it independently
COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
