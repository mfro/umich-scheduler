FROM node:6

ENV NPM_CONFIG_LOGLEVEL warn

ADD ./backend /app/backend
ADD ./common /app/common

WORKDIR /app/backend

RUN yarn install
RUN yarn build

ENV NODE_ENV production

RUN yarn install

EXPOSE 8081

CMD node .
