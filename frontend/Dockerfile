FROM node:22.17.1-alpine3.22 AS builder
WORKDIR /build
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:1.29.0-alpine3.22
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /build/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/health/live || exit 1
