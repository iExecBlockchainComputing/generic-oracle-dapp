FROM node:14-alpine3.10

RUN mkdir /app && cd /app

RUN npm i node-fetch@2.6.x \
        ethers@5.1.0 \
        jsonpath@1.1.x \
        big.js@6.0.x \
        yup@0.32.x \
        path@0.12.x

COPY ./src /app

ENTRYPOINT [ "node", "/app/app.js"]