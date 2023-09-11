# Instructions to run Hauling Backend for local development

## Requirements

[Provisioning Instructions](./provisioning.md)

## Getting started

1. Make sure that you have the following ENV variables set to these values:

- `NODE_ENV="development"`
- `ENV="local"`

## Usage

Open terminal windows (or tab) in the project directory and run:

- `yarn start:dev`

It will start server and file watcher that will restart the server on every file change

## Faq

1. Cannot connect to DB:

- make sure you're using correct `.env` file, commands:
- `cat ./.env | grep _CONTAINER` show all docker containers names from `.env`
- `cat ./.env | grep DB_` show all DB configs from `.env`

  will help you

2. Having troubles with docker:

- again, make sure you're using correct `.env` file, commands:
- `yarn docker:local:list` list all containers related to hauling local env
- `yarn docker:local:stop` stop all containers related to hauling local env
- `yarn docker:local:prune` remove all stopped containers and volumes related to hauling local env
- `yarn docker:stop` stop all containers
- `yarn docker:clean` remove all stopped containers and volumes
- `yarn docker:prune` remove all stopped containers, images, volumes, networks

  will help you
