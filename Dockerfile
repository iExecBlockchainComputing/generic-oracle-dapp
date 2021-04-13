FROM node:10
RUN mkdir /app && cd /app
RUN npm i node-fetch@2.6.x
RUN npm i ethers@5.1.0
RUN npm i jsonpath@1.1.x
COPY ./src /app
ENTRYPOINT [ "node", "/app/app.js"]