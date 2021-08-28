FROM node:current-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm isntall

COPY . .

RUN mkdir cache && mkdir logs

CMD [ "node", "main.js" ]
