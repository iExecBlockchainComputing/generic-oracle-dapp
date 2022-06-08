FROM node:14-alpine3.10

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src/ .

#ci?
RUN npm i

#multi-stage then dist only?
RUN npm run build

ENTRYPOINT [ "node", "dist/app.js"]