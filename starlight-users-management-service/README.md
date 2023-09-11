# Starlight User Management Service

> **Important:** Starlight and AppIt use **development** as your base branch. **No longer v2/develop**!

## Table of Contents

- [Getting started](#getting-started)
- [Technology stack](#technology-stack)
- [Development](#development)
  - [Initializing the Project](#initializing-the-project)
  - [Environment Vars and Docker](#environment-vars-and-docker)
  - [Run User Management Service](#run-user-management-service)
  - [Code style](#code-style)
  - [Commands](#commands)
- [Setting up local tenant](#setup-local-tenant-and-user)
  - [Creating your tenant](#creating-your-tenant)
- [Updating Cognito UI](#updating-cognito-ui)
- [Project structure](#project-structure)
- [DB and Migrations](#db-and-migrations)

## Getting started

You need to make sure the following are installed:

- [`Node 16.14.1`](https://nodejs.org/en/) LTS (Not 17)
- [`yarn` v1](https://classic.yarnpkg.com/lang/en/) (**not** berry)
- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 19.03 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22 or newer

## Technology stack

Stack:

- Node.js v16.14.1 (LTS)
- Yarn 1
- Koa 2
- TypeScript
- Postgresql 13
- Redis
- TypeORM
- GraphQL
- Type GraphQL

## Development

**Always** make sure your branch is up to date especially development -- run `git pull` and `yarn install` whenever you begin to work.

Most up to date overview of the entire platform environment is located in the [Starlight Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067922951/User+Management+Service). Reading the Wiki section on UMS is the best way to get up and running. The steps below are explained in detail over there.

Environment variables for all of the UMS are listed and explained on the [Environment Variables page](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067431454/Env+Vars+-+UMS).

### Initializing the Project

1. Make sure that your local project folder has the latest files from `development` branch, `git checkout development && git pull`.

2. Install the dependencies with `yarn install`

### Environment Vars and Docker

1. Create `.env` in project root with variables from `.env.example`. Run `cp .env.example .env` to easily create your `.env`.

2. Fill in values in `.env` with environment-specific configuration; Reach out to others for necessary values. All of the "ASK" variable values are the same as the hauling backend. **NOTE:** The environment variable `USE_HTTPS` should be `USE_HTTPS=false` to login locally using the local hauling frontend (localhost:7001) and your Cognito user from dev3.

3. **Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the [shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup

### Run User Management Service

1. Run `yarn` or `yarn install` to install the required dependencies if you havent already.
2. **Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the [shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup
3. Run the server `yarn start:dev` to reload on changes.

### Code style

We use Prettier and ESLint to format and check code. It should cover 90% of cases. If in doubt, just ask others.
Check the [Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2068545546/Code+Style) for the latest code style and git conventions.

### Commands

- `yarn start:dev` - start service in watch mode, for development
- `yarn start` - sarts the service (compiled w/ sourcemaps)
- `yarn lint` - run linter
- `yarn typeorm` - TypeORM CLI with ts-node
- `yarn typeorm migration:create` - create a new empty migration, example `yarn migration:create -n MyNewAwesomeMigrationName`
- `yarn typeorm migration:generate` - generate a new migration, from diff between entities and database;
  for instance, example `yarn migration:generate -n MyNewAwesomeMigrationName`
- `yarn migration:revert` - revert last migration
- `yarn setup:admin` - setup admin user in local DB and Cognito if it is missing

## Setup Local Tenant and User

This information is located in the [Starlight Docs Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067595278/Tenant+and+User+Creation).

### Creating Your Tenant

Follow the instructions in the [UMS Tenant Creation Section of the Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067595278/Tenant+and+User+Creation)

## Updating Cognito UI

If you need to update the default Cognito UI, follow these steps:

1. Make sure you have set the values to the variables AWS_COGNITO_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_COGNITO_USER_POOL_ID and AWS_COGNITO_CLIENT_ID.
2. Make the necessary changes in `cognito/custom-css.css`. **DO NOT ADD NEW CLASSES! DO NOT RENAME CLASSES! ADD NEW LAYOUT PROPERTIES WITH CARE!!!**
   You have been warned.
3. If necessary, replace `cognito/header.png`. **DO NOT USE ANYTHING BESIDES PNG OR JPEG!!! DO NOT NAME FILE ANYTHING ELSE!**
4. Check your changes with `yarn cognito:serve`. This will launch a local web server (by default on port 8081) with your customized UI.
5. Upload your changes with `yarn cognito:upload-cutomizations`. Make sure to do this for _every_ user pool separately.

## Project structure

- `scripts` - folder with scripts
- `cognito` - Cognito customizations
- `src/config.ts` - config for the service
- `src/entities` - TypeORM entities
- `src/graphql` - GraphQL resolvers and types
- `src/middleware` - common middleware
- `src/db/migrations` - `typeorm` migrations
- `src/routes` - creates and exports root router
- `src/services` - services used by our app
- `src/main.ts` - main file

## DB and Migrations

### Migrations

#### Create new migration

`yarn typeorm migration:create -n NameOfANewMigration`

#### Generate new migration

`yarn typeorm migration:generate -n NameOfANewMigration`

#### Run migrations

Because of `TYPEORM_MIGRATIONS_RUN` environment variable, migrations will run on start of the service.
If you want to apply migrations manually, run the following command:

`yarn typeorm migration:run`
