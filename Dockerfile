FROM sconecuratedimages/public-apps:node-10-alpine-scone3.0

### install dependencies you need
RUN apk add bash nodejs-npm
RUN SCONE_MODE=sim npm install node-fetch@2.6.x
RUN SCONE_MODE=sim npm install @ethersproject/solidity@5.0.x
RUN SCONE_MODE=sim npm install jsonpath@1.1.x

COPY ./src /app

###  protect file system with Scone
COPY ./protect-fs.sh ./Dockerfile /build/
RUN sh /build/protect-fs.sh /app

ENTRYPOINT [ "node", "/app/app.js"]