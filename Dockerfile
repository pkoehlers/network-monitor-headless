FROM node:current-buster

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production
COPY dist .

CMD [ "node", "app.js" ]