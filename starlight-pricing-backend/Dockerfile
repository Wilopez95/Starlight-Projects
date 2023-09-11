FROM node:16

RUN mkdir /app

WORKDIR /app

COPY package.json yarn.lock /app/

ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN
RUN test -n "$NPM_TOKEN" && echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc
RUN echo "@starlightpro:registry=https://npm.pkg.github.com" >> .npmrc

RUN corepack enable
RUN yarn install --production
COPY . /app/

EXPOSE 3011

CMD yarn run-dist
