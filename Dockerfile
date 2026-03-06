FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY tsconfig.json ./
COPY config/ ./config/
COPY src/ ./src/

RUN npx tsc

EXPOSE 3000

CMD ["node", "dist/server.js"]
