FROM node:6

ENV NPM_CONFIG_LOGLEVEL warn

ADD . /app

WORKDIR /app/backend

RUN npm i
RUN npm run build

ENV NODE_ENV production

RUN npm prune
RUN npm i

EXPOSE 8081

CMD node .
