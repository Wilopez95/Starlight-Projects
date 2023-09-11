# Trash API

> **Important:** Starlight and AppIt development as your base branch. **Not v2/develop**!

## Table of contents

- [Trash API](#trash-api)
- [Table of contents](#table-of-contents)
- [Getting started](#getting-started)
- [Technological stack](#technological-stack)
  - [Development](#development)
    - [Setting up your environment](#setting-up-your-environment)
    - [Common conventions](#common-conventions)
    - [Code style](#code-style)
    - [Scripts](#scripts)
    - [Git conventions](#git-conventions)
    - [Documentation](#documentation)
- [Project structure](#project-structure)

## Getting started

You need to make sure the following are installed:

- [`Node 16.14.1`](https://nodejs.org/en/) LTS (Not 17)
- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 20.10.8 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 3.8 or newer

## Technological stack

Trash API uses the following libraries and products:

- Node.js 16.14.1
- Express 4
- PostgreSQL 12.3
- Knex.js and node-sql-2 for query generation
- RabbitMQ 3.8
- Redis Alpine

## Development

Most up to date overview of the entire platform environment is located in the [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2072608772/Running+the+Trash+API). Reading the section on TrashAPI is the best way to get up and running. The steps below are explained in detail over there.

Environment variables for all of the TrashAPI are listed and explained on the [Environment Variables page](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068676635/Env+Vars+-+Trash+API).

### Setting up your environment

**Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the [shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup

1. Make sure that your local project folder has the latest files from `development` branch, `git checkout development && git pull`.
2. Create `.env` in project root with variables from `.env.example`.  
  `cp .env.example .env`
3. Fill in values in `.env` with environment-specific configuration;
  reach out to others for necessary values. Many of them are the same as the hauling backend.
4. A Complete dvelopment env variable file can be found [here](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2072608772/Running+the+Trash+API)

### Running the TrashAPI

1. Run `yarn` or `yarn install` to install the required dependencies if you havent already.
2. Run the server `yarn start:dev` to reload on changes or `start:skip` to not run migrations and skip mq setup.

    ```shell
    yarn start:dev  # also starts nodemon watching your files
    ```

   or

    ```shell
    yarn start  # without nodemon
    ```

Check out the instructions on [Tenant and User Creation](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067595278/Tenant+and+User+Creation) to set up a local tenant and user

> **Note**
>
> If you need to use a remote database and/or Elasticsearch instance, you will need to set up an SSH tunnel.
> Reach out to @strues (Steven) if you need any help with that.

### Common conventions

- Any route is followed after /*api for the purpose of CloudWatch work
- Use dashes in API routes instead of camel case or underscores.
- Use camel case for naming dirs, files, object or class fields, columns in db queries.
- Use snake case for naming schemas, tables or columns in migrations or seeds.
- Use _only_ arrow functions except for class methods.
- Do not run any DB queries inside controllers.
- try..catch is required at least on controller level. Surround with try..catch any transaction operations inside services.
- Use async-await over promises or generators
- Prefer functional style over loops (except in performance-critical code _after_ benchmarking and verifying that
    the function invocation is the bottleneck in your case).
- Remember we are using ES6 modules. This has some implications:

  - you will need to use _at least_ Node 13.5 to run it without a flag;
  - you need to specify file extensions in imports unlike CommonJS.

- Prefer simple files that export one thing as a default export (this does not apply to everything in `routes/` folder).
- Do not use custom error instances, re-use the existing `APIError` class from `src/services/error/index.js`.

    ...to be continued.

### Code style

We use Prettier and ESLint to format and check code. It should cover 90% of cases. If in doubt, just ask others.

### Scripts

- `start` - start the server without any external monitoring
- `debug` - start the debug server
- `start:dev` - start the server with nodemon
- `start:skip` - start the server and skip AMQP and PostgreSQL initialization  
- `migrate:latest` - run all migrations and seeds
- `migrate:up [fileName]` - run specified [fileName] migration or the next chronological migration that has not yet be run
- `migrate:down [fileName]` - undo the specified [fileName] migration or the last migration that was run
- `migrate:rollback` - rollback last batch
- `migrate:rollback:all` - rollback all migrations
- `migrate:unlock` - forcibly unlocks the migrations lock table, and ensures that there is only one row in it
- `migrate:make [fileName] [--schema|-s]` - create migration by specific [fileName] (specify the schema or will be created for tenants)
- `seed:make [fileName] [--schema|-s]` - create seed by specific [fileName] (specify the schema or will be created for tenants)
- `seed:run [fileName] [--schema|-s]` - run seeds all or by specific [fileName] (specify the schema if you want run for single schema)
- `db:reset` - fully reset current database
- `schema:drop [schemaName]` - rollback and drop specified [schemaName]
- `schema:create [schemaName]` - create and migrate specified [schemaName]
- `mq:reset` - reset AMQP queues

### Git conventions

To not clutter the README, this have been moved. You can find this information in the [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068545546/Code+Style).

### Documentation

At this moment, single representation of API documentation is Postman configuration file (see /docs/\*.json folder). That is why keeping this up to date is all developers duty so should be followed until we move to more advanced documentation tool.

Therefore in case of CRUD updates of API - Postman .json file update is mandatory and must be delivered with correspondant PR.

## Project structure

- `apidocs/` - API and hand-written documentation
- `src/index.js` - main entry point
- `src/app.js` - Express.js initialization
- `src/config.js` - configuration loading, all configuration variables should be specified there
- `src/auth/` - module for SSO usage
- `src/consts/` - enums and other constants
- `src/db/` - database connection, seeding, schema and other DB-related configurations
- `src/db/migrations/` - migration files loaded by Knex.js
- `src/db/seeds` - Knex.js seed files
- `src/middlewares/` - Express.js middlewares
- `src/models/` - models(services) to create/read/update/delete items
- `src/routes/` - API routes and controllers
- `src/services/errors/` - ApplicationError class and custom error codes
- `src/services/` - integrations with external services
- `src/tables/` - described database tables
- `src/utils/` - general-purpose utility functions
- `src/views/` - views for database tables
- `scripts/` - scripts to run independently of main app
- `test/; src/__fixtures__/; src/routes/__tests__` - tests, test utils, fixtures
