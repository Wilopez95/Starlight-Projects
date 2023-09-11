# Starlight Route Planner Backend

> **Important:** Starlight and AppIt use **development** as your base branch. **Not v2/develop**!

## Table of contents

- [Starlight Route Planner Backend](#starlight-route-planner-backend)
  - [Table of contents](#table-of-contents)
    - [Other topics](#other-topics)
  - [Getting started](#getting-started)
  - [Technology stack](#technology-stack)
  - [Development](#development)
    - [Initializing the Project](#initializing-the-project)
    - [Environment Vars and Docker](#environment-vars-and-docker)
    - [Run Route Planner Backend](#run-route-planner-backend)
    - [Git conventions](#git-conventions)

### Other topics

- [Route Planner Postman](./docs/StarlightRoutePlannerService.postman_collection.json)

## Getting started

You need to make sure the following are installed:

- [`Node 16.14.1`](https://nodejs.org/en/) LTS (Not 17)
- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 19.03 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22 or newer

## Technology stack

Starlight Route Planner Backend uses the following libraries and products:

- Node.js v16.14.1 (LTS)
- Yarn
- PostgreSQL 12.1
- Koa.js 2 as our server framework of choice
- Joi for request validation
- Knex.js for query generation

## Development

Most up to date overview of the entire platform environment is located in the
[Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067824641/Getting+Started).
Reading the Wiki section on Route Planner Backend is the best way to get up and running. The steps
below are explained in detail over there.

Environment variables for all of the Route Planner Backend are listed and explained on the
[Environment Variables page](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2072248349/Env+Vars+-+Route+Planner+BE).

### Initializing the Project

1. Make sure that your local project folder has the latest files from `development` branch,
   `git checkout development && git pull`.

2. Install the dependencies with `yarn install`

### Environment Vars and Docker

1. Create `.env` in project root with variables from `.env.example`. Run `cp .env.example .env` to
   easily create your `.env`.

2. Fill in values in `.env` with environment-specific configuration; Reach out to others for
   necessary values. All of the "ASK" variable values are the same as the hauling backend.

3. A Complete dvelopment env variable file can be found
   [here](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2072117263/Running+the+Route+Planner+Backend)

### Run Route Planner Backend

1. **Recommended** you run the backend services (Postgres, Redis, RabbitMQ, etc) from the
   [shared-backend](https://github.com/Starlightpro/starlight-shared-backend) docker setup
2. Run the server `yarn start:dev` to reload on changes.

### Git conventions

To not clutter the README, this have been moved. You can find this information in the repo
[Starlight Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2072117263/Running+the+Route+Planner+Backend).
