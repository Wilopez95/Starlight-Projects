# Starlight Core Backend

> **Important:** Starlight and AppIt use **development** as your base branch. **Not v2/develop**!

## Table of contents

- [Wiki](https://github.com/Starlightpro/starlight-docs/wiki/)
- [Starlight Core Backend](#starlight-core-backend)
  - [Table of contents](#table-of-contents)
    - [Other topics](#other-topics)
  - [Getting started](#getting-started)
  - [Technology stack](#technology-stack)
  - [Development](#development)
    - [Setting up your environment](#setting-up-your-environment)
    - [Common conventions](#common-conventions)
    - [Scripts](#scripts)
    - [Git conventions](#git-conventions)
    - [Documentation](#documentation)
  - [Project structure](#project-structure)

### Other topics

- [Postman collection]('./docs/StarlightCoreService.postman_collection.json)
- [E2E (API) Testing](./docs/e2e-testing.md)
- [Multi-tenancy](./docs/multi-tenancy.md)
- [Elasticsearch management](./services/elasticsearch/README.md)
- [Database snapshots](./db/snapshot/README.md)
- [Pricing Engine](./docs/Pricing Engine/README.md)
- [Taxes](./docs/Taxes/README.md)
- [Contributors](./docs/Contributors.md)

## Getting started

The [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview) is the best source for detailed up to date information. Please make sure to read it and contribute. **Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the [shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup

You need to make sure the following are installed:

- [`Node 16.14.1`](https://nodejs.org/en/) LTS. Not 17.
- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 19.03 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22 or newer

## Technology stack

Starlight Core uses the following libraries and products:

- Node.js 16.14.1 (LTS)
- PostgreSQL 13.1 with PostGIS extension
- Elasticsearch 7.4 for full-text search
- Koa.js 2 as our server framework of choice
- Joi for request validation
- Knex.js for query generation

## Development

> **Note**
>
> If you need to use a remote database and/or Elasticsearch instance, you will need to set up an SSH tunnel.  
> Reach out to Steven if you need any help with that.  
> The SSH tunnel requires a private key to access the bastion and PuTTy to be installed on Windows.  
> **Still waiting on some details before this will work!!!!**

### Setting up your environment

Go to the [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview), seriously. There's a lot to digest; Way more than should be in this readme.

### Running Locally

See the documentation over at the [Starlight Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2072543233/Running+the+Hauling+Backend). There it covers everything you need to run the service and communicate with the others.

**Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the [shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup

### Scripts

- `start` - starts the server without any external monitoring
- `start:dev` - starts the server with nodemon
- `migrate new [--tenant|-t] <migration_name>` - creates a new migration file from stub in `db/migrations/`
- `migrate up` - runs all migrations that have not been run yet
- `migrate down` - rolls back the most recent migration batch
- `migrate rollback` - rolls back ALL the migrations
- `migrate down` - alias for `db migrate:down`
- `seed run` - runs all seeds
- `snapshot generate` - generates a DB snapshot for reference
- `snapshot export` - exports the DB snapshot as a spreadsheet

### Common conventions

- Any route is followed after /api for the purpose of CloudWatch work
- Use dashes in API routes instead of camel case or underscores.
- Use camel case for naming dirs, files, object or class fields, columns in db queries.
- Use snake case for naming schemas, tables or columns in migrations or seeds.
- Use _only_ arrow functions except for class methods.
- Do not run any DB queries inside controllers, call the repos' methods only there.
- try..catch is required at least on controller level. Surround with try..catch any transaction operations inside repos.
- Use async-await over promises or generators
- Prefer functional style over loops (except in performance-critical code _after_ benchmarking and verifying that
  the function invocation is the bottleneck in your case).
- All subscriber-scoped entities should be cached with the name of the subscriber as cache-key (used in-memory cache).
  Check `repos/_base.js` to see a good example of how this works in practice.
  The same pattern should be preferred whenever something that manages subscriber-specific data is created.
- Remember we are using ES6 modules. This has some implications:

  - you will need to use _at least_ Node 13.5 to run it without a flag;
  - there are _no_ directory imports with `index.js` files (in other words, there is nothing special about `index.js` file);
  - you need to specify file extensions in imports unlike CommonJS.

- Prefer simple files that export one thing as a default export (this does not apply to everything in `routes/` folder).
- Do not use custom error instances, re-use the existing `ApiError` class from `errors/ApiError.js`.

  ...to be continued.

### Git conventions

To not clutter the README, this have been moved. You can find this information in the repo [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview).

### Documentation

The [Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview) is the best source for documentation unless you need the API docs, in which case keep reading.

At this moment, single representation of API documentation is Postman configuration file (see /docs/\*.json folder). That is why keeping this up to date is all developers duty so should be followed until we move to more advanced documentation tool.

Therefore in case of CRUD updates of API - Postman .json file update is mandatory and must be delivered with correspondant PR.

## Project structure

- `server.js` - main entry point
- `config.js` - configuration loading, all configuration variables should be specified there
- `consts/` - enums and other constants
- `db/` - database connection, seeding, schema and other DB-related configurations
- `db/migrations/` - migration files loaded by Knex.js
- `db/seeds/` - Knex.js seed files
- `db/snapshot/` - a representation of current DB state; this is not the source of truth for the DB,
  it is just there as reference because we do not have something like models
- `db/stubs/` - stub files used by Knex.js to generate new seeds and migrations
- `docker/` - custom non-default Docker files; for now, it only contains a Dockerfile for PostgreSQL with PostGIS
- `docs/` - API and hand-written documentation
- `errors/` - ApiError class and custom error codes
- `middlewares/` - Koa.js middlewares
- `repos/` - repository-pattern repositories for manipulating DB entities
- `routes/` - API routes, controllers and validation schemas
- `scripts/` - scripts to run independently of main app
- `services/` - integrations with external services
- `tests/` - tests, test utils, fixtures
- `utils/` - general-purpose utility functions

## Deployment

| Environment | Branch       | Is automatically starting |
| ----------- | ------------ | ------------------------- |
| dev         | development  | true                      |
| dev3        | development  | true                      |
| qa1         | development  | false                     |
| qa2         | development  | false                     |
| staging     | development  | false                     |
| demo        | development  | false                     |
| PROD        | tech/release | false                     |

Development enviroments are able to accept any changes. To push changes into `UAT-REC` - concrete changes must be tested and approved to move forward by cherry-picking the list of commits. After re-testing at UAT environment changes could be deployed on `PROD` environment with simple merging whole the `tech/REC-uat` branch into `tech/release`.
