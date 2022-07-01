FROM node:14-alpine3.10 AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY src/ .
RUN npm ci
# Future note: Run unit tests automatically
RUN npm run build
# Copy generated *.js to /app so we can use them
RUN cp -R app/* ./

FROM node:14-alpine3.10
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app ./
ENTRYPOINT [ "node", "/app/app.js"]
