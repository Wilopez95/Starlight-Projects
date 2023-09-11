# Monoepo for Recycling Client

> **Important:**  Use **develop** as your base branch. **Not development**!

- [Common](https://github.com/Starlightpro/starlight-recycling-frontend/blob/development/packages/common/README.md)
- [Recycling](https://github.com/Starlightpro/starlight-recycling-frontend/blob/development/packages/recycling/README.md)
- [i18nSync](https://github.com/Starlightpro/starlight-recycling-frontend/tree/development/packages/i18nSync)
- Scale App can be removed, we replaced it with PrintNode

## Tech debts

- Move Datatable to common
- write tests
- run cypress tests in CI/CD

## Packages publishing

This repository has 3 packages at all, but 2 of them for publishing. `@starlightpro/i18nSync` is tool provides functionality for managing translation files between client and i18n provider. There are 2 more modules: `@starlightpro/common` and `@starlightpro/recycling`. `Common` is used as ui kit in `Recycling`, but could also be used in any other application. `Recycling` is developed as SPA, but also is used as SDK in `Hauling` app. Since `Common` is configurable by theme styling, `Hauling` app has an example how to change styles due to its requirements.

GitHub Actions will publish automatically to a private repo only if

- there is a change in a package path
- and if its version is changed in package.json
- and if changes are merged into branch `rc`

This process is controlled in `.github/workflows/publish_common.yml` and `.github/workflows/publish_recycling.yml`

## Deployment

Deployed automatically to `dev` once merged into `tech/uom`

Deployment is configured and happening in [Jenkins](https://ci.starlightsoftware.io/)

## Ports for local development

| Port |      Destination      |
| ---- | :-------------------: |
| 3003 |   Recycling backend   |
| 8000 |  Recycling frontend   |
| 7001 | Hauling/Core frontend |
| 3004 | Route planner backend |
| 3000 | Hauling/Core backend  |
| 3001 |    Billing backend    |
| 3002 |      UMS backend      |

## Local setup

### Schemas

[set up BE app](https://github.com/Starlightpro/starlight-recycling-backend#development) and run it. Then run here

`yarn schema:generate`

### Frontend with target to remote backend

set `PROXY_TARGET` in env to a remote backend and run `yarn start`

### Frontend with target to local backend

run `yarn start`

## Common conventions

- Do not use class components.
- Use destructuring of props in components.
- Use _only_ arrow functions except for class methods.
- Do not use non-null assertion operator `!`. Use _only_ when it is impossible to do without it.

## Code style

Just use Prettier and adhere to ESLint recommendations. It should cover 90% of cases. If in doubt, just ask others.

## Git conventions

Branch names should be prefixed with `tech/`, `feature/` or `bugfix/` followed by ticket number from Jira,
dash and a few descriptive words.  
Example: `feature/REC-1289-enhance-origin-selection`

Commit messages must follow the following format:

```text
[Ticket number] [message]

[Optional body]
```

Example: `REC-1289 Enhance Origin Selection`.  
Long example:

```text
REC-1289 Enhance Origin Selection

Enhance Origin Selection and finish place new Origin screen
This commit finishes Origin creation flow and gives users the ability to
place new Origins and create customers and job sites.

* Fix creation of credit cards on origin page
* Fix typings of origin form
```

Another example:

```text
REC-111 Support deleting users

* Integrate with backend user management API
* Remove user profile on deletion
```

The message should be capped at 75 characters and must be in indefinite tense. It should read as _'\[If accepted, this commit will\] add order creation'_.

If provided, the body might include a detailed header, long description and a list of changes with bullet points, all of which are optional (you can use `*` in Markdown).  
Please, DO NOT use `fixes`, `applied fixes` and other meaningless messages. If you apply fixes in a batch, use
`git commit --amend` to prevent creating meaningless commits.

PR titles should follow the same format as commit messages. Just so that you know, if you submit a PR with one commit only, GitHub assigns the title of the commit to the PR and saves you quite a bit of typing.

## Links for development

AWS Account ID 737403176629

AWS Region us-east-1

[CloudWatch](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:logs-insights)

Application logs are in log groups name like: `/aws/containerinsights/[ENV]-cluster/application`.

Each application has its own label at `kubernetes.labels.app`.

Kibana can be accessed via ssh tunnel only using url `http://localhost:5601/app/home#/`

RabbitMQ UI can be accessed via ssh tunnel only using port `8080`

[Recycling Confluence space](https://starlightpro.atlassian.net/wiki/spaces/NSCARAD/pages/121503757/RECYCLING+development)

[Figma](https://www.figma.com/files/team/865970689739481842/Starlight)

[Jenkins](https://ci.starlightsoftware.io/)

[Lobby qa](https://hauling.qa.starlightsoftware.io/lobby)

[Lobby dev](https://hauling.dev.starlightpro.net/lobby)
