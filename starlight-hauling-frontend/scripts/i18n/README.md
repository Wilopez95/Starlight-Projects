# I18N Sync tool

Tool provides functionality for managing translation files between client and i18n provider
`For now provider is` [PO Editor](https://poeditor.com/)

## Installation

create a file at the root of the project
`.i18nrc.json`

configuration example:

```json
{
  "poEditor": {
    "apiKey": "1a4c1a47...",
    "apiUrl": "https://api.poeditor.com/v2/",
    "projectName": "sh-frontend",
    "languages": ["en_US", "en_UK", "fr_CA"],
    "defaultLanguage": "en_US"
  },
  "translationsJsonFolder": "src/i18n/locales"
}
```

this file should not be present in the codebase, added to `.gitignore`

## Synchronization flow

To update translations json need next steps

- `git checkout v2/develop && git pull` # get latest updates
- `yarn run i18nSync:push` # push default language (e.g. en_US) to i18n provider

Next extra steps are needed to proceed translation on provider side (e.g. POEditor)
if all translation prepared and ready for deploy

- `create branch for translations` # according repository common guide
- `yarn run i18nSync:pull` # pull all translated files to repo
  -- If just specific translation have to pulled use
- `yarn run i18nexec -- --pullOne fr_CA` # pull specific translation to the repo (e.g. fr_CA)

- `git commit -am "<translation updated text>"` # commit and so on ...

-- NOTE: All translation proceed cannot be done automatically by the provider (at least POEditor)

### API

| Command                                         | Description                              |
| ----------------------------------------------- | ---------------------------------------- |
| `yarn run i18nSync:pull`                        | pull translation files from provider     |
| `yarn run i18nSync:push`                        | push source/default language to provider |
| `i18nSync:exec -- --pullOne <Translation name>` | (e.g. en_UK)                             |
