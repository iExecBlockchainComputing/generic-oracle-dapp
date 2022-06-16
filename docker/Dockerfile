FROM node:14-alpine3.10

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src/ .
RUN npm ci 
# TODOs:
# - Use multistage
# - Add npm ci --only=production option
# - Run unit tests automatically
RUN npm run build
# Copy generated *.js to /app so we can use them
RUN cp -R app/* ./

ENTRYPOINT [ "node", "/app/app.js"]
