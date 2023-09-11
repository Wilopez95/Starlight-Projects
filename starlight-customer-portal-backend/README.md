# Customer Portal Backend

## Table of contents

-   [Customer Portal Backend](#customer-portal-backend)
    -   [Table of contents](#table-of-contents)
    -   [Getting started](#getting-started)
    -   [Technological stack](#technological-stack)
    -   [Development](#development)
        -   [Setting up your environment](#setting-up-your-environment)
        -   [Common conventions](#common-conventions)
        -   [Code style](#code-style)
        -   [Scripts](#scripts)
        -   [Git conventions](#git-conventions)
        -   [Documentation](#documentation)
    -   [Project structure](#project-structure)

## Getting started

You need to make sure the following are installed:

-   [`Node 16.14.1`](https://nodejs.org/en/) or newer
-   [`yarn` classic](https://classic.yarnpkg.com/en/docs/install) (not yarn 2.x)

## Technological stack

Customer Portal uses the following libraries and products:

- Node.js 16.14.1
- Koa.js 2 as our server framework of choice

## Development

### Setting up your environment

After installing the above, you need to perform the following steps to set your development machine:

1. Do not forget to run `yarn` or `yarn install` to install the required dependencies.
2. Use `.env.example` file as guidance and set up the environment variables listed there.
   Reach out to others to get the necessary configurations. _This is required to set up the app!_
3. Run

    ```shell
    yarn start  # without nodemon
    ```

    or

    ```shell
    yarn start:dev  # also starts nodemon watching your files
    ```

4. Check instructions on [Confluence](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067595278/Tenant+and+User+Creation) to set up a local tenant and user.

> **Note**
>
> If you need to use a remote database and/or Elasticsearch instance, you will need to set up an SSH tunnel.
> Reach out to @fullhaus if you need any help with that.

### Common conventions

-   Any route is followed after /api for the purpose of CloudWatch work
-   Use dashes in API routes instead of camel case or underscores.
-   Use camel case for naming dirs, files, object or class fields, columns in db queries.
-   Use snake case for naming schemas, tables or columns in migrations or seeds.
-   Use _only_ arrow functions except for class methods.
-   Do not run any DB queries inside controllers.
-   try..catch is required at least on controller level. Surround with try..catch any transaction operations inside repos.
-   Use async-await over promises or generators
-   Prefer functional style over loops (except in performance-critical code _after_ benchmarking and verifying that
    the function invocation is the bottleneck in your case).
-   Remember we are using ES6 modules. This has some implications:

    -   you will need to use _at least_ Node 13.5 to run it without a flag;
    -   there are _no_ directory imports with `index.js` files (in other words, there is nothing special about `index.js` file);
    -   you need to specify file extensions in imports unlike CommonJS.

-   Prefer simple files that export one thing as a default export (this does not apply to everything in `routes/` folder).
-   Do not use custom error instances, re-use the existing `ApplicationError` class from `errors/ApplicationError.js`.

    ...to be continued.

### Code style

We use Prettier and ESLint to format and check code. It should cover 90% of cases. If in doubt, just ask others.

### Scripts

-   `start` - starts the server without any external monitoring
-   `start:dev` - starts the server with nodemon

### Git conventions

> **Note**
>
> Proper branch names and commit messages are required!

Branch names should be prefixed with `tech/`, `feature/` or `bugfix/` followed by ticket number from Jira,
dash and a few descriptive words.
Example: `feature/JIRA-999-order-creation`

Commit messages must follow the following format:

```text
[Ticket number] [message]

[Optional body]
```

Example: `JIRA-999 Add order creation`.  
Long example:

```text
CUSTOMER-PORTAL-999 Add order creation

Add order creation and finish place new order screen
This commit finishes order creation flow and gives users the ability to
place new orders and create customers and job sites.

* Fix creation of credit cards on order page
* Fix typings of order form
```

Another example:

```text
JIRA-111 Support deleting users

* Integrate with backend user management API
* Remove user profile on deletion
```

The message should be capped at 75 characters and must be in indefinite tense. It should read as _'\[If accepted, this commit will\] add order creation'_.

If provided, the body might include a detailed header, long description and a list of changes with bullet points, all of which are optional (you can use `*` in Markdown).  
Please, DO NOT use `fixes`, `applied fixes` and other meaningless messages. If you apply fixes in a batch, use
`git commit --amend` to prevent creating meaningless commits.

PR titles should follow the same format as commit messages. Just so that you know, if you submit a PR with one commit only, GitHub assigns the title of the commit to the PR and saves you quite a bit of typing.

### Documentation

At this moment, single representation of API documentation is Postman configuration file (see /docs/\*.json folder). That is why keeping this up to date is all developers duty so should be followed until we move to more advanced documentation tool.

Therefore in case of CRUD updates of API - Postman .json file update is mandatory and must be delivered with correspondant PR.

## Project structure

-   `server.js` - main entry point
-   `config.js` - configuration loading, all configuration variables should be specified there
-   `consts/` - enums and other constants
-   `docs/` - API and hand-written documentation
-   `errors/` - ApplicationError class and custom error codes
-   `middlewares/` - Koa.js middlewares
-   `routes/` - API routes, controllers and validation schemas
-   `services/` - integrations with external services
-   `tests/` - tests, test utils, fixtures
-   `utils/` - general-purpose utility functions
-   `auth/` - module for SSO usage
