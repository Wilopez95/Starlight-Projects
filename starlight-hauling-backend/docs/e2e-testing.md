# Instructions to run Hauling Backend e2e (API) tests locally

## Requirements

You need to make sure the following are installed:

- [`Node 16.14.1`](https://nodejs.org/en/) or newer (prefer to use `nvm` to manage versions of nodejs)
- [`yarn` modern](https://yarnpkg.com/getting-started/install) (not yarn classic, it's old and EOL)
- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 19.03 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22 or newer

## Getting started

1. Get appropriate `.env` file and put it into project directory:

Make sure that you have the following ENV variables set to these values:

- `NODE_ENV="test"`
- `ENV="e2e"`

2. You need to run this commands in your terminal (in project directory) in a sequence:

- `yarn set config berry`
- `yarn install`
- `yarn docker:e2e:pull`

3. You need to run this command in your terminal (in project directory):

- `yarn docker:e2e:start`

4. Setup local DB from `dev1` dumps: [DB Setup](./setup-db-from-dump.md)

## Usage

Then you have to open 2 (two) terminal windows (or tabs) in the same directory and run:

- `yarn start:dev` in the first terminal window (or tab)
- `yarn test` in the second terminal window (or tab)

### Ensure all calls to the Billing Services have been mocked properly

> **Note** logs are available via `yarn pm2 logs` command
> **Note** you must learn [Nock Documentation](https://www.npmjs.com/package/nock) > **Note** you can override mocks of requests to billing at `tests/e2e/mocks.js` file.
>
> You can change default arguments stub for mock helpers at `tests/e2e/servicesMocks/billing`.
>
> Don't change an interface of mock helpers at `tests/e2e/servicesMocks/billing`.
>
> You can create your own case-specific mocks and include them into `tests/e2e/mocks.js` file. But please follow the folders structure for them.
>
> You'll find which request you have to mock via custom interceptor from app logs after running tests.

### Cover route handlers under `/routes/<handler>` folder

#### Put you tests near the controller under `/__tests__` folder

- Test file must end with `.e2e.spec.js`.

- If test file exceeds 400 line of code - split.

- In some cases it makes sense to create nested folders structure for them.

- If tests uses some non-common fixtures - put them near test files and fixtures files must end with `.fixture.js`.

### UMS service is mocked in a dumb way - by a set of ENV vars

- MOCKED_USER_TOKEN_ID
- MOCKED_USER_TOKEN_DATA
- MOCKED_USER_INFO

> **Note** this grunts Admin privileges to the user that is used to run tests and ACL cannot be tested properly for now.
>
> This is in TODO list.

### Trash API is not mocked at all currently. So you'll not be able to test them properly. This is also in TODO list

### Recycling Backend API is not mocked at all currently. So you'll not be able to test them properly. This is also in TODO list
