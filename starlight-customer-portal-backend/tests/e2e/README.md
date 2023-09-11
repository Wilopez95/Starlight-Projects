## Setup

#### 1. NodeJS

-   Install (`v14.4.0+`)
    -   [Ubuntu 18](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04)
    -   [Windows](https://nodejs.org/download/release/v14.13.1/)
-   Install `yarn` package manager: `npm i -g yarn`

#### 2. App dependencies

-   Run `yarn` in repo root folder

## Getting started

### Ensure you've set proper environment variables:

##### 1. Make sure it's commented if you want to see logs of request/response

```shell script
#LIGHT_LOGS="true"
```

##### 2. To make debugging easier

```shell script
PRETTY_LOGS="true"
```

##### 3. To see all logs

```shell script
LOG_LEVEL="debug"
```

##### 4. To see sensitive fields in logs (is ok for tests and local development)

```shell script
LOGGING_HIDE="skip_from_log"
```

### Testing:

##### 1. Run tests

```shell script
yarn test
```

##### 2. See pm2 processes running

```shell script
yarn pm2 list
```

##### 3. Kill all pm2 processes

```shell script
yarn pm2 delete all
```

##### 4. See logs of app instance launched by pm2

> **Note** better to run in separate terminal to monitor app logs during tests

```shell script
yarn pm2 logs
```

## Other

> **Coverage for e2e tests is not implemented**
> Because it must be not code coverage but endpoints coverage.
> There is a way to partially gather coverage via middleware
> that will get all routes and test helper that will use
> this to compare with tested endpoints list (and similar approach for GraphQL)

> **e2e tests must be structured by roles and features sets**
