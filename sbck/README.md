# Starlight Billing Backend

> **Important:** Starlight and AppIt use **development** as your base branch. **Not v2/develop**!

## Table of contents

- [Starlight Billling Backend](#starlight-billing-backend)
  - [Table of contents](#table-of-contents)
    - [Other topics](#other-topics)
  - [Getting started](#getting-started)
  - [Technology stack](#technology-stack)
  - [Development](#development)
    - [Setting up your environment](#setting-up-your-environment)
    - [Running the backend](#running-the-backend)
    - [Git conventions](#git-conventions)

### Other topics

- [Reporting](./docs/reporting/README.md)
- [Billing Postman](./docs/StarlightBillingService.postman_collection.json)
- [Exago Postman](./docs/reporting/ExagoInit.postman_collection.json)

## Getting started

You need to make sure the following are installed:

- [`Node 16.14.1`](https://nodejs.org/en/) LTS (Not 17)
- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 19.03 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22 or newer

## Technology stack

Starlight Billing uses the following libraries and products:

- Node.js v16.14.1 (LTS)
- PostgreSQL 12.1
- Koa.js 2 as our server framework of choice
- Joi for request validation
- Knex.js for query generation
- GraphQL and Apollo

## Development

Most up to date overview of the entire platform environment is located in the
[Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview). Reading the
Wiki section on Billing Backend is the best way to get up and running. The steps below are explained
in detail over there.

Environment variables for all of the Billing Backend are listed and explained on the
[Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview).

### Setting up your environment

**Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the
[shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup

1. Make sure that your local project folder has the latest files from `development` branch,
   `git checkout development && git pull`.
2. Create `.env` in project root with variables from `.env.example`.  
   `cp .env.example .env`
3. Fill in values in `.env` with environment-specific configuration; reach out to others for
   necessary values. Many of them are the same as the hauling backend.

### Running the Backend

1. Run `yarn` or `yarn install` to install the required dependencies if you havent already.
2. Start the database from the
   [shared-backend](https://github.com/Starlightpro/starlight-shared-backend)
3. Run the server `yarn start:dev` to reload on changes or `start:skip` to not run migrations.

### Commands

- `yarn start:dev` - start service in watch mode, for development
- `yarn start` - sarts the service without reloading
- `yarn start:skip` - starts the service without migrations and without rabbitmq setup
- `yarn lint` - run linter
- `yarn migrate` - database migration script
- `yarn seed` - runs the database seeds to populate
- `yarn snapshot` - generate a database snapshots
- `yarn generate-schema` - generates graphql schema compiled into a single file called `schema.gql`.
  This file needs to be copied over to recycling backend and renamed to `billing-schema.gql` to
  generate schemas over there.
- `yarn db:reset` - resets the database by rolling back migrations, re-migrating and then seeding
- `yarn mq:reset` - resets the rabbitmq instance
- `yarn pm2:start` - starts the server using pm2 with the name test-billing-server
- `yarn pm2:stop` - stops the server using pm2 with the name test-billing-server and deletes it
- `yarn prettier` - formats with prettier
- `yarn test` - starts the tests
- `yarn posttest` - resets the database

### Git conventions

To not clutter the README, this have been moved. You can find this information in the
[Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/overview).

## Deployment

IMPORTANT: Do not change graphql schemas. Use `@deprecated` for ones that should be removed on next
deployments. Only schema extensions are acpetable in each deploy!

| Environment | Branch       | Is automatically starting |
| ----------- | ------------ | ------------------------- |
| dev         | development  | true                      |
| dev3        | development  | true                      |
| qa1         | development  | false                     |
| qa2         | development  | false                     |
| staging     | development  | false                     |
| demo        | development  | false                     |
| PROD        | tech/release | false                     |

Development enviroments are able to accept any changes. To push changes into `UAT-REC` - concrete
changes must be tested and approved to move forward by cherry-picking the list of commits. After
re-testing at UAT environment changes could be deployed on `PROD` environment with simple merging
whole the `tech/REC-uat` branch into `tech/release`.
