FROM node:14-alpine

WORKDIR /

COPY package.json tsconfig.json ./
COPY src/ .
RUN npm install
RUN npm run build

ENTRYPOINT [ "node", "/app/app.js"]