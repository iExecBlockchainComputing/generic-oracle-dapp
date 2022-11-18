FROM node:14-alpine3.10 AS builder
COPY package*.json tsconfig.json ./
COPY src/ /src/
# region-config-file
ARG CONFIG_FILE
RUN echo "CONFIG_FILE : ${CONFIG_FILE}"
RUN test -n "$CONFIG_FILE"
COPY $CONFIG_FILE src/config.json
RUN cat src/config.json
# endregion-config-file
RUN npm ci
RUN npm run build
# Copy generated *.js to /app so we can use them
RUN cp -R app/src/* ./app

FROM node:14-alpine3.10
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app ./
ENTRYPOINT [ "node", "/app/app.js"]
