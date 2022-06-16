FROM node:14-alpine3.10

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src/ .
RUN npm ci 
#TODO, use multistage and --only=production 
#TODO: Add automated testing somewhere
RUN npm run build

RUN cd app/ && mv * ../

RUN ls -la

ENTRYPOINT [ "node", "/app/app.js"]