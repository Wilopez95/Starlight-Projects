# Starlight Dispatch UI

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

> **Important:** Starlight and AppIt **no longer** should anyone be using v2/ or v1.5/. Back to normal.

## Getting started

- Install [`Node 16.14.1`](https://nodejs.org/en/) LTS
- [`yarn` classic](https://classic.yarnpkg.com/en/docs/install) 1.22 (not yarn 2.x)

## Development

**Always** make sure your branch is up to date especially development -- run `git pull` and `yarn install` whenever you begin to work.

Most up to date overview of the entire platform environment is located in the [Starlight Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067824641/Getting+Started). The steps below are explained in detail over there.

### Initializing the Project

1. Make sure that your local project folder has the latest files from `development` branch, `git checkout development && git pull`.

2. Make sure you have gotten a personal access token for GitHub in order to pull down from GitHub Package Registry

3. Install the dependencies with `yarn install`


### Run Dispatch

1. Run `yarn` or `yarn install` to install the required dependencies if you havent already.
2. Start Dispatch with `yarn start:dev`.

By default the `start:dev` expects the backends to be running locally. The command `yarn start:dev3` will proxy to the dev3 environment. A browser will open to localhost:7001.

### Build

```bash
cd dispatch
yarn install
yarn build:<environment>

```

### Git conventions

To not clutter the README, this have been moved. You can find this information in the [Starlight Docs](https://starlightpro.atlassian.net/wiki/spaces/DEV/pages/2067824641/Getting+Started).
