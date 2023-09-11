# Starlight Core Frontend

> **Important:** Starlight and AppIt use **development** as your base branch. **Not v2/developt**!

## Getting started

- Install [`Node 16.14.1`](https://nodejs.org/en/) LTS
- Follow instructions listed [here](https://github.com/Starlightpro/starlight-shared-libs/blob/master/README.md)

## Development

### Entirely Local

The command `yarn start:local` will launch the dev server on `localhost:7001` and send API requests to the locally running hauling backend server (expected to run on `localhost:3000`).

When running entirely local, in order for Cognito to login you must have `USE_HTTPS=false` in the .env of the locally running UMS.

### Usage with Recycling

The variable `ENABLE_RECYCLING_FEATURES=` is set in the `webpack/env/*` file for your environment. Setting it to true will enable recycling and false will disable it. On the local environment and dev3, it is on by default.

### Local Frontend with Remote Backend

The command `yarn start:dev` will launch the dev server on `localhost:7001` and proxies API requests to the local hauling backendd running at `http://localhost:3000`.

**How to locally log in to remote backend:**

Due to an issue with webpack-dev-server, it is currently not possible to proxy requests to remote backend
with `changeOrigin` option disabled. Therefore, some manual hacking is required to establish access to backends.

1. Go to `hauling.dev3.starlightpro.net`.
2. Log in with your usual credentials.
3. Open browser developer tools and copy `sessioncookie` cookie.
   For Chrome: Go to _application_, select _hauling.dev3.starlightpro.net_, then _cookies_.
   For Firefox: Go to _storage_, select _hauling.dev3.starlightpro.net_, then _cookies_.
4. Go to localhost:7001 (or whichever port you use to run the app locally).
5. Go to the cookies tab, select _localhost:7001_ and add the cookie you copied in step 3.
   Make sure cookie has `secure` set to `false` and `path` to `/`.
6. Run `yarn start:dev3`.

Since choosing a business unit or global configuration triggers a navigation request, it will redirect you
to dev3. To prevent this, you have to use a local backend. Otherwise, if you need to go to global configuration or some BU,
you will have to change the URL manually. So just click the business unit link and then change the domain part from
`hauling.dev3.starlightpro.net` to `localhost:7001`.

## Build

```shell
yarn build
```

Builds the app to ./dist/client and prepares it for distribution.

## Testing

```shell
yarn test        # run all tests
yarn test:unit   # run unit tests
```

### Unit testing

All unit tests must be placed inside `__tests__` folder for each module. For example if you want to
test `@root/hooks/useBoolean.ts` you should create or, if it's already created, put new test file
into `@root/hooks/__tests__` folder.

Use the following template for unit test file names `{unitName}.unit.spec.{extension}`
For example: `useBoolean.unit.spec.ts` or `ConfirmModal.unit.spec.tsx`

## Storybook

Not done yet :(

## Linting

```shell
yarn lint:ts     # lint only code with ESLint
yarn lint:styles # lint styles with Stylelint
yarn lint        # both
```

Normally, you do not need to run ESLint and Stylelint manually because pre-commit hooks will do it for you.

## Project structure

- `webpack` - webpack configuration
- `assets` - static images and SVG's imported via Webpack loaders
- `dist` - build artifacts
- `src/api` - services for backend integration and HTTP helpers
- `src/common` - re-usable common, general-purpose components
- `src/components` - app-specific components
- `src/config` - API keys, static configurations etc.
- `src/consts` - constants and enums
- `src/css` - global styles
- `src/helpers` - general-purpose helpers
- `src/hooks` - custom hooks
- `src/pages` - pages and page-specific components
- `src/stores` - MobX stores and entity classes
- `src/types` - typings of common entities, API responses, global .d.ts files and utility types
- `src/i18n` - internationalization and localization source [documentation](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068807761/i18n+Guide)

## Project tools

- `scripts/i18n` - translations synchronization tool [documentation](scripts/i18n/README.md)

## Aliases

- `@root` => `src`
- `@hooks` => `src/hooks`
- `@assets` => `assets`
- `@tests` => `tests`

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
- Place props with default values at the end of import list (e.g `active, onClick, disabled = false`)
  ...to be continued.

## Code style

Just use Prettier and adhere to ESLint recommendations. It should cover 90% of cases. If in doubt, just ask others.
Check the [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068545546/Code+Style) for the latest code style and git conventions.

## Git conventions

Check the [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068545546/Code+Style) for git conventions.
