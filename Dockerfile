FROM node:14-alpine

WORKDIR /web

COPY package.json yarn.lock ./
RUN yarn install

USER node
CMD yarn start
