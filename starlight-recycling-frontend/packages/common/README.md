## Purpose of this package

Shared code between frontend packages.

## Publishing

This package is published automaticaly via GitHub Actions to private repo under name `@starlightpro/common`

IMPORTANT: Publishing will be triggered only if there is change in this package and the version is bumped.

## Available Scripts

In the project directory, you can run:

    "test": "echo 'here will be tests'",
    "build": "tsc -p tsconfig.json",
    "schema:generate": "gql-gen --config codegen.yml && yarn schema:prettify",
    "schema:prettify": "eslint --fix src/graphql/api.tsx && prettier --single-quote --write src/graphql/api.tsx",
    "watch": "tsc -p tsconfig.json --watch"

### `precommit`

linter for precommit

### `lint`

runs all linters

### `lint:eslint`

runs eslint

### `lint:tsc`

check with Typescript

### `test`

mocked

TODO: add tests

### `build`

transpile `.ts(x)?` files with `tsc` into this folder

### `schema:generate`

Generate code out of GraphQL schema and queries wrapped with `gql` and runs prettifier on generated code.

### `schema:prettify`

runs prettifier on generated code.

### `watch`

runs `tsc` in watch mode
