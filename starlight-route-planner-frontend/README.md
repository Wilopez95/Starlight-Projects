# Starlight Route Planner Frontend

**No longer using the v2/develop branches** instead, back to the development flow

## Getting started

- Install [`Node 16.14`](https://nodejs.org/en/) or newer and
  [`yarn` classic](https://classic.yarnpkg.com/en/docs/install) 1.22 (not yarn 2.x)
- Follow instructions listed
  [here](https://github.com/Starlightpro/starlight-shared-libs/blob/master/README.md)

## Development

Most up to date overview of the entire platform environment is located in the
[Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068480036/Route+Planner+FE).

### Initializing the Project

1. Make sure that your local project folder has the latest files from `development` branch,
   `git checkout development && git pull`.

2. Install the dependencies with `yarn install`

### Running Route Planner Frontend

```shell
yarn start:local
```

Will launch the dev server on `localhost:7003` using the local backends running on `localhost:3000`

```shell
yarn start:dev3
yarn start:dev
```

Will launch the dev server on `localhost:7003` that proxies all API requests to the dev3 or dev
backend.

## Build

```shell
yarn build
yarn build:<env> # will build whatever environment you substiute for <env>. Ex: yarn build:dev3
```

Builds the app to ./dist/client and prepares it for distribution.

## Storybook

Not done yet :(

## Linting

```shell
yarn lint:ts   # lint only code with ESLint
yarn lint:scss # lint styles with Stylelint
yarn lint      # both
```

Normally, you do not need to run ESLint and Stylelint manually because pre-commit hooks will do it
for you.

## Project structure

- `webpack` - webpack configuration
- `assets` - static images and SVG's imported via Webpack loaders
- `dist` - build artifacts
- `src/api` - services for backend integration and HTTP helpers
- `src/common` - re-usable common, general-purpose components
- `src/config` - API keys, static configurations etc.
- `src/consts` - constants and enums
- `src/css` - global styles
- `src/helpers` - general-purpose helpers
- `src/hooks` - custom hooks
- `src/pages` - pages and page-specific components
- `src/stores` - MobX stores and entity classes
- `src/types` - typings of common entities, API responses, global .d.ts files and utility types

## Aliases

- `@root` => `src`
- `@hooks` => `src/hooks`
- `@assets` => `assets`

## Common conventions

- Start interface names with letter `I` (e.g. `IEntity`).
- Do not use class components.
- Use destructuring of props in components.
- Access stores via `useStores` hook.
- Use _only_ arrow functions except for class methods.
- Do not use non-null assertion operator `!`. Use _only_ when it is impossible to do without it.
- Use the following order in the interfaces:
  - `requiredField: type`;
  - `optionalField?: type`;
  - `requiredMethod(): void`;
  - `optionalMethod?(): void`;
- Place props with default values at the end of import list (e.g
  `active, onClick, disabled = false`)

## Code style

Check the
[Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068611090/Git+Conventions) for the
latest code style and git conventions.
