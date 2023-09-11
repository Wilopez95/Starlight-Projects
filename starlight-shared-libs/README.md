# starlight-shared-libs

Monorepo for starlight shared libraries

## Libraries available

- [Invoice Builder](#invoice-builder)
- [Request Signer](#request-signer)
- [Shared Components](#shared-components)
- [OSM Helpers](#osm-helpers)

## Scripts

- `lint:ts` - lint code of all libraries
- `lint:styles` - lint styles of all libraries
- `lint` - lint both code & styles
- `storybook` - run storybook

## How to install libraries from this repo

1. Generate personal access token at [Github](https://github.com)
   1. Open Settings -> Developer settings -> Personal access tokens -> Generate new token
   2. Check `read:packages` checkbox
   3. Generate token
2. Create `.npmrc` in your project root (next to package.json file)
3. Add following lines to `.npmrc` (replace TOKEN with token generated on previous steps):

```config
npm.pkg.github.com/:_authToken=TOKEN
@starlightpro:registry=https://npm.pkg.github.com
```

4. Now you can safely install libraries from this repo

## Invoice Builder

- name - @starlightpro/invoice-builder
- location - packages/invoice-builder

## Request Signer

- name - @starlightpro/request-signer
- location - packages/request-signer

## Shared Components

- name - @starlightpro/shared-components
- location - packages/shared-components

## OSM Helpers

- name - @starlightpro/osm-helpers
- location - packages/osm-helpers

## How to build

```shell
yarn build
```

Builds the app to `./build` and prepares it for distribution.

##

## How to test changes locally

In package you want to link

```shell
yarn link
```

In your current project

```shell
yarn link [package...]
```

To reverse this process, simply use `yarn unlink` or `yarn unlink [package]`

##
