# starlight-recycling-backend
For recycling backend

# TODO squash migrations before release

## Table of contents

- [Tech Debt](#tech-debt)
- [Getting started](#getting-started)
- [Technological stack](#technological-stack)
- [Hosting](#Hosting)
  - [Within S3](#within-s3)
  - [Within API](#within-api)
  - [Proxy to kubernetes](#proxy-to-kubernetes)
- [Development](#development)
  - [Setting up the environment](#setting-up-your-environment)
  - [Code style](#code-style)
  - [Commands](#commands)
  - [Git conventions](#git-conventions)
  - [Example env file](#example-env-file)
  - [Checklist to create new Entity in database and GraphQL](#checklist-to-create-new-entity-in-database-and-graphql)
  - [Access Token Info](#access-token-info)
- [Project structure](#project-structure)
- [DB and Migrations](#db-and-migrations)
  - [Migrations](#migrations)
    - [Createe new migration](#createe-new-migration)
    - [Generate new migration](#generate-new-migration)
    - [Run migrations](#run-migrations)
    - [Seed database or Seed Migration (for production)](#seed-database-or-seed-migration-for-production)

### Other topics

-   [Multi-tenancy](./docs/multi-tenancy.md)
-   [Paltform Account and confgs](./docs/paltform-account-and-configs.md)
-   [Users And Permissions](./docs/users-and-permissions.md)


## Tech Debt

- update urls in this file
- rename `platformAccount` to `tenantName`
- rename `serviceAccount` to `buId`
- all commands `migration:*` are running only against one hardcoded schema, move this value to `.env`
- service and workers are running within same instace, separate it and run separately
- Refactor worker and `*Indexed` entities to have full control of what is going into index. recommendated way is to use GraphQL


## Getting started

You need to make sure the following are installed:

-   [`Node 14`](https://nodejs.org/en/) or newer
-   [`yarn` classic](https://classic.yarnpkg.com/en/docs/install) (not yarn 2.x)
- Docker
- Run docker-compose
- init Core queues using script in Core backend repo `yarn mq:sync`
- setup access to AWS or download `billing-schema.gql`, to be able to generate SDK for Billing Service GraphQL
- run `schema:generate:billing`

### Setup tunnel to env

1. get from DevOps or other team member encyption key for ssh tunnel.
2. add config to `~/.ssh/config` file
3. based on example below, run `ssh dev1-core`

```bash
Host dev1-core
  IdentityFile /path to your encryption key file
  User centos
  # hostname of a machine that has access to closed network 
  Hostname ec2-176-34-208-249.eu-west-1.compute.amazonaws.com

  # this just a comment
  # Localforward [local port] [domain of a host that accessible only via tunnel]:[port to tunnel from]
  
  # db
  Localforward 5432 dev1-core-aurora-starlight-core-cluster.cluster-cphf51vkuivh.eu-west-1.rds.amazonaws.com:5432

  # hauling
  # redis
  Localforward 6380 dev1-core-cluster-starlight.wvdqr6.0001.euw1.cache.amazonaws.com:6379
  # rabbitmq
  Localforward 5673 internal-aad2946ca9a12473bb1d6c1975934fe9-277715021.eu-west-1.elb.amazonaws.com:5672
  # elasticsearch audit
  Localforward 8220 vpc-dev1-core-audit-log-fod3qpve6n3gfu2d7z36jv46ya.eu-west-1.es.amazonaws.com:443
  # elasticsearch 
  Localforward 8221 vpc-dev1-core-starlight-wkzbjfmrvmuwajkj4geoobzf4e.eu-west-1.es.amazonaws.com:443
  
  # recycling
  # redis
  Localforward 6379 dev1-core-cluster-recycling.wvdqr6.0001.euw1.cache.amazonaws.com:6379
  # elasticsearch
  Localforward 9200 vpc-dev1-core-recycling-5robk6wb3ieppdhjbpuarvzzt4.eu-west-1.es.amazonaws.com:443
```

Where can I get Hostname (Bastion) for a tunnel? - ask team member or DevOps

Where can I get hostname of a service hostname and port for a tunnel? - same way as for Bastion or via Lens.

In Lens you get find a pod and read its environment variables that contain needed hostname and port.


## Technological stack

Stack:
* Node.js v14
* yarn v1
* Koa 2
* TypeScript latest
* Postgresql 12
* Redis
* Typeorm
* GraphQL
* Typegraphql
* Jest latest

## Hosting

CloudFront -> Path Patterns -> S3 or API

`/static` -> all requests are going to S3
`/*` -> all requests are going to API

DEV Admin - https://dev.recycling.starlightpro.net/starlight/admin/1/

DEV Recycling - `https://dev.recycling.starlightpro.net/starlight/recycling/1/`

CI/CD - https://172.25.3.151/blue/organizations/jenkins/

### Within S3

In a single bucket we must a "structure" that looks just like a request path, because CloudFront blindly redirects to S3 bucket and S3 in turn treats a path as an object path.

Example:
`static/recycling/manifest.json`

### Within API

`/:platformAccount/:serviceName/:serviceAccount/(.*)` - handler for this pattern is responcible to give to the user correct `index.html`

Exmple:

`https://dev.recycling.starlightpro.net/starlight/recycling/1/` - will return an `index.html` file from configured bucket using object key `static/recycling/index.html`

### Proxy to kubernetes

Best option is to use [Lens](https://k8slens.dev/)

Setup Instractions: https://github.com/Starlightpro/starlight-recycling-devops/tree/master/kubernates

1. Get Access token: `kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}') `
2. Run `kubectl proxy`
3. Enter obtained Access token

[Local Proxy Link](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/overview?namespace=recycling)


## Development

### Setting up your environment

* Install and run Postgresql 12 or higher
* Install and run Redis
* Create a user that can signin in Postgresql, for example `devrecyclinguser`
* Create a database `startlight` or some other name, your choice
* postgres user must have full access to that database
* create `.env` in project root with content from example env file
* change values in `.env` according to your environment
* run `yarn`
* run `yarn start`

### Project dependencies

#### User Management Service (UMS)

Runtime dependency. It will fetch GraphQL schema at the start as GraphQL Federation


#### Billing Service

Before Compile time. We need to run codegen to generate code and types out of GraphQL schema of Billing Service.

Codegen will look for schema file in project root: `billing-schema.gql`

How can you get this file:

- ask teammate
- download artifact from build job, example: `aws s3 cp s3://starlight-schemas/billing-schema-dev1-core.gql billing-schema.gql`
- get billing repo `starlight-billing-backend` and run `yarn schema-generate`, copy generated `schema.gql` to project root as `billing-schema.gql`

it might be better if billing service had `schema.gql` commited in their repo.


### Code style
We use Prettier and ESLint to format and check code. It should cover 90% of cases. If in doubt, just ask others.

### Commands

* `yarn start` - start service in watch mode, for development
* `yarn server` - sarts the seervice
* `yarn test` - run test `*.spec.ts` files
* `yarn lint` - run linter
* `yarn lint:quite` - run linter and make fixes quitely
* `yarn generate-keys` - generate `src/jwks.json` encryption keys for cookies and jwt
* `yarn migration:run` - run all migrationts
* `yarn migration:create` - create a new empty migration, example `yarn migration:create MyNewAwesomeMigrationName`
* `yarn migration:generate` - generate a new migration, from diff between entities and database, example `yarn migration:generate MyNewAwesomeMigrationName`
* `yarn migration:revert` - revert last migration
* `seed:run` - run `typeorm-seeding`

### Git conventions
Branch names should be prefixed with `tech/`, `feature/` or `bugfix/` followed by ticket number from Jira, dash and a few descriptive words. Example: `feature/REC-999-order-creation`

Commit messages must follow the following format:

```
[Ticket number] - [message]

[Optional body]
```

Example: `REC-999 Add order creation.`
Long example:

```
REC-999 - Add order creation

Add order creation and finish place new order screen
This commit finishes order creation flow and gives users the ability to
place new orders and create customers and job sites.

* Fix creation of credit cards on order page
* Fix typings of order form
```

Another example:

```
REC-111 Support deleting users

* Integrate with backend user management API
* Remove user profile on deletion
```
The message should be capped at 75 characters and must be in indefinite tense. It should read as '[If accepted, this commit will] add order creation'.

If provided, the body might include a detailed header, long description and a list of changes with bullet points, all of which are optional (you can use * in Markdown).
Please, DO NOT use fixes, applied fixes and other meaningless messages. If you apply fixes in a batch, use git commit --amend to prevent creating meaningless commits.

PR titles should follow the same format as commit messages. Just so that you know, if you submit a PR with one commit only, GitHub assigns the title of the commit to the PR and saves you quite a bit of typing.


### Example env file

config: `.env.example`

docs: https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md#which-configuration-file-is-used-by-typeorm

### Server Tokens

Sole purpose is a secure and trusted communication between services.

IMPORTAN:
- Each service must use same keys for encryption
- in `.env`, string values must include `\n` in place of new line sign

Example:
```bash
SERVICE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA/Ad/eiZUKj/2znAfBThXPL/1l8N2ktI25Z03UU4e9TM=\n-----END PUBLIC KEY-----"
SERVICE_SECRET_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAhW36UJMA9VvAICCAAw\nDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEEKIAULWeHVdh90QROLSIA1wEQFz8\nZPu1swhZg7qN+BD8hiPvupI0T0fmxaIXGr/sL65lN/EiQP7P+cTrMg0r/MCl3oV9\nO5INb+PiihZNwcw3zys=\n-----END ENCRYPTED PRIVATE KEY-----"
SERVICE_SECRET_KEY_PASSPHRASE=top secret
```
notice `\n`


### Checklist to create new Entity in database and GraphQL

* a file for an entity in `entities` folder
* a class decorated with `@Entitiy()` and `@ObjectType()` to define DB table and GraphQL Type
* a resolver, for newly created entity, in `graphql/resolvers` folder
* new resolver is added to the list of resolvers
* Migration is created with `up` and `down`
* Migration is working `up` and `down`

### Access Token Info

Run a query with access token:
```graphql
{
  me {
    lastName
    firstName
    email
    resource
    permissions
  }
}
```

Example curl:
```bash
curl --request POST \
  --url http://localhost:5000/api/graphql \
  --header 'authorization: Bearer q29dFCozz00r3uFpG4xPPOgkQRYkbqr5R-6PjYjjarW' \
  --header 'content-type: application/json' \
  --data '{
	"query": "query {me { permissions lastName firstName email resource permissions }}"
}'
```


## Project structure

* `scripts` - folder with scripts
* `src` - source files
  * `src/@types` - global types or type extensions
  * `src/config` - configs for the service
  * `src/constants` - shared constants for the service
  * `src/entities` - shared entities accross modules
  * `src/factories` - factories for `typeorm-seeding`
  * `src/graphql` - anything that is shared in context of graphql
  * `src/middleware` - common middleware
  * `src/migrations` - `typeorm` migrations
  * `src/modules` - service modules
    * `src/module/[name]/index.ts` - entry point of a module
    * `src/module/[name]/entities` - folder that containes data entities
    * `src/module/[name]/graphql` - graphql related files
    * `src/module/[name]/graphql/index.ts` - graphql related entry point
    * `src/module/[name]/graphql/resolvers` - graphql resolvers
    * `src/module/[name]/graphql/types` - graphql types, if there is a need
  * `src/router` - creates and exports root router
  * `src/seeds` - seeds for `typeorm-seeding`
  * `src/services` - services used by our service
  * `src/services` - shared services used by our service
  * `src/types` - common types accros service
  * `src/utils` - common utils
  * `src/index.ts` - main file
  * `src/jwks.json` - generated by `yarn generate-keys` for cookies and jwt
* `.env` - file with environment variables for the service
* `.eslintrc.js` - config file for ESLint
* `.gitignore` - specifies file and folders that must not be committed to git
* `.prettierrc` - config file for Prettier
* `Dockerfile` - Dockerfile instructs docker on how to create a container
* `package.json` - npm config with commands, dependencies and with
* `jest` config
* `tsconfig.json` - config for TypeScript
* `tsconfig.test.json` - config for TypeScript in `jest` environment
* `yarn.lock` - locks for dependencies version


## DB and Migrations

### Migrations

#### Createe new migration

`yarn migration:create NameOfANewMigration`

#### Generate new migration

`yarn migration:generate NameOfANewMigration`

#### Run migrations

Becausee of `TYPEORM_MIGRATIONS_RUN` environment variable, migrations will run on start of the service.

`yarn migration:run`

Important: transaction mode for migrations must state in "each" mode. Otherwise seeding as trunsactions will not work.

#### Seed database or Seed Migration (for production)

Important: one migration must be within one trunsaction.

1. Create a migration `yarn migration:create NameOfANewMigration`
2. Open newly create migration file
3. Add code in `up` and `down`

Example in `up`:
```typescript
const platformAccount = new PlatformAccount();
platformAccount.id = 'example';
platformAccount.name = 'example platform account';

await platformAccount.save({
  transaction: false, // this is important, transactions are managed my migration runner
});
```

Example in `down`:
```typescript
await PlatformAccount.delete(
  {
    // you can use one or more fields here, it is a WHERE part of DELETE query
    id: 'example', 
    name: 'example platform account',
  },
  {
    // this is important, transactions are managed my migration runner
    transaction: false,
  },
);
```

### Config to access Kibana

`~/.ssh/config`
```
Host Dev1_kibana
  IdentityFile /Users/yaroslav.porodko/Downloads/dev-recycling-eleks_1
  User centos
  Hostname 34.249.71.203
  Localforward 9443 vpc-dev-recycling-dkqumqxhvbolqhqtzhlg3pihnq.eu-west-1.es.amazonaws.com:443
```

run `ssh Dev1_kibana`

access at https://localhost:9443/_plugin/kibana/app/kibana#/discover

### Generate Service Token Keys

run command `yarn generate-service-keys` to get env variables and use the same in each service, otherwise it will not work