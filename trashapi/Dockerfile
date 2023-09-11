FROM node:16
LABEL maintainer="Starlight Dev Team <dev@starlightpro.com>"

RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock .yarnrc /app/

ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN
RUN test -n "$NPM_TOKEN" && echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc
RUN echo "@starlightpro:registry=https://npm.pkg.github.com" >> .npmrc

# RUN corepack enable
RUN yarn install --production
COPY . /app/
RUN yarn swagger:build

EXPOSE 3000

CMD ["node", "src/index.js"]
