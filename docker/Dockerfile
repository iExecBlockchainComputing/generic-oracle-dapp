FROM node:14-alpine

WORKDIR /

COPY package.json tsconfig.json ./
COPY src/ .
RUN npm install
#TODO: Add automated testing somewhere
RUN npm run build

ENTRYPOINT [ "node", "/app/app.js"]