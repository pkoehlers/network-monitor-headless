FROM node:current-buster

RUN groupadd --gid 5000 networkmonitor \
    && useradd --home-dir /home/networkmonitor --create-home --uid 5000 \
        --gid 5000 --shell /bin/sh --skel /dev/null networkmonitor

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY dist .

RUN chown -R networkmonitor:networkmonitor .

USER networkmonitor

CMD [ "node", "server.js" ]