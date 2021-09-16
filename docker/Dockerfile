FROM node:14-alpine3.10

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --only=production

COPY ./src /app

ENTRYPOINT [ "node", "/app/app.js"]