FROM node:14.13.1-alpine3.12

RUN mkdir /app

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN yarn install
COPY . /app/
RUN yarn build

ENV NODE_ENV production

EXPOSE 3000
EXPOSE 3010

CMD yarn start
