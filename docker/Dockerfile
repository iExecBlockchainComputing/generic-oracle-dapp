FROM node:14-alpine3.10 AS builder
COPY package*.json tsconfig.json ./
COPY src/ ./src/
ARG CONFIG_FILE
RUN echo "CONFIG_FILE : ${CONFIG_FILE}"
RUN test -n "$CONFIG_FILE"
COPY $CONFIG_FILE src/config.json
RUN npm ci
RUN npm run build
RUN cp -R app/src/* ./app

FROM node:14-alpine3.10
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app ./
ENTRYPOINT [ "node", "/app/app.js"]
