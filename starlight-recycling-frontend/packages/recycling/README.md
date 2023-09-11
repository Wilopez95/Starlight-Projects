# Starlight Recycling Frontend

## Getting started

- Install [`Node LTS`](https://nodejs.org/en/) or newer and [`yarn` classic](https://classic.yarnpkg.com/en/docs/install) 1.22 (not yarn 2.x)
- Run `yarn` to install dependencies from monorepo's root

## Development

`All npm scripts have to be run from the monorepo's root`

#### Generate code API client code. bekend have to be lunched locally

```shell
yarn run schema:generate
```

## Run app

```shell
yarn start
```

## Build

```shell
yarn build
```

Builds the app to ./recycling/build and prepares it for distribution.

## Publishing

Published automatically as a package via GitHub Actions to a private repo under the name `@starlightpro/recycling`.

IMPORTANT: Publishing will be triggered only if there is change in this package and the version is bumped.

## Linting

```shell
yarn lint
```

## How to access Recycling frontend?

Via lobby and business unit.
