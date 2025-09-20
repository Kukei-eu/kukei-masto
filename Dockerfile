FROM node:22-alpine

WORKDIR app

COPY . .

RUN yarn install

RUN yarn make:hash

CMD yarn start
