# Starlight Route Planner Frontend

## Getting started

- Use **Development** not v1.5 or v2/
- Install [`Node 16.15`](https://nodejs.org/en/) or newer and [`yarn` classic](https://classic.yarnpkg.com/en/docs/install) 1.22 (not yarn 2.x)
- Follow instructions listed [here](https://github.com/Starlightpro/starlight-shared-libs/blob/master/README.md)
- Run `yarn` to install dependencies

## Development

```shell
yarn start
```

Will launch the dev server on `localhost:7001`

```shell
yarn start:local
```

Same as above, but instead of proxying all API requests, uses a local server (expected to run on `localhost:3000`).

## Build

```shell
yarn build
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

Normally, you do not need to run ESLint and Stylelint manually because pre-commit hooks will do it for you.

## Project structure

- `webpack` - webpack configuration
- `assets` - static images and SVG's imported via Webpack loaders, should be cleaned using same from `@starlightpro/shared-components`
- `dist` - build artifacts
- `src` - application development directory, contains modules:

  - `app` - entrypoint to application, mounts app, renders routes, applies providers for theme, auth, inits history etc.
  - `assets` - imports of svg images, should be cleaned.
  - `core` - contains features that could be used in any module.
  - `auth` - Authentication module.
  - `customer` - Customer Profile module.
  - `finance` - Finance module.
  - `[ConcreteModule]`:

    - `/api/` - services for calling backend
    - `/components/` - common or uniq components in frame of a module
    - `/forms/` - forms of module, includes: formik data, validation, layout
    - `/layout(container)/` - basic containers
    - `/pages/` - pages in frame of module
    - `/quickViews/`
    - `/store/`
    - `/routes.tsx` - general module navigation

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
- Place props with default values at the end of import list (e.g `active, onClick, disabled = false`)
  ...to be continued.

## Code style

Just use Prettier and adhere to ESLint recommendations. It should cover 90% of cases. If in doubt, just ask others.

## Git conventions

Branch names should be prefixed with `tech/`, `feature/` or `bugfix/` followed by ticket number from Jira,
dash and a few descriptive words.  
Example: `feature/HAULING-999-order-creation`

Commit messages must follow the following format:

```text
[Ticket number] [message]

[Optional body]
```

Example: `HAULING-999 Add order creation`.  
Long example:

```text
HAULING-999 Add order creation

Add order creation and finish place new order screen
This commit finishes order creation flow and gives users the ability to
place new orders and create customers and job sites.

* Fix creation of credit cards on order page
* Fix typings of order form
```

Another example:

```text
HAULING-111 Support deleting users

* Integrate with backend user management API
* Remove user profile on deletion
```

The message should be capped at 75 characters and must be in indefinite tense. It should read as _'\[If accepted, this commit will\] add order creation'_.

If provided, the body might include a detailed header, long description and a list of changes with bullet points, all of which are optional (you can use `*` in Markdown).  
Please, DO NOT use `fixes`, `applied fixes` and other meaningless messages. If you apply fixes in a batch, use
`git commit --amend` to prevent creating meaningless commits.

PR titles should follow the same format as commit messages. Just so that you know, if you submit a PR with one commit only, GitHub assigns the title of the commit to the PR and saves you quite a bit of typing.
