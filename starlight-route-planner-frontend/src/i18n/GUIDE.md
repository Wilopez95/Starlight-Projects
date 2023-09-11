# Add new language ultimate guide

## - First we need to configure app

### `!IMPORTANT` **English language** is default language! use it as source language for translations!

## Let's add s new language to our project!

for example Ukrainian `uk_UA`

#### 1. Create `uk_UA.json` file in the folder `src/i18n/locales`;

#### 2. Add to configuration to region config `src/i18n/config/region.ts`

this configuration contains all tenant specific functions date formats, phones etc.

related helpers placed in folders `src/i18n/format` -> currency, date, phone. \
And `src/i18n/validate` -> phone

#### 3. Add to configuration language config `src/i18n/config/language.ts`

this configuration contains user selected language specific data

#### 4. Types

All configs have enums with Language and Region \
add new language to enums

`src/i18n/config/language.ts`

```diff
export enum Languages {
  EN_US = 'en_US',
  EN_UK = 'en_UK',
  FR_CA = 'fr_CA',
+ UK_UA = 'uk_UA',
}
```

and

`src/i18n/config/region.ts`

```diff
export enum Regions {
  US = 'US',
  GB = 'GB',
  CA = 'CA',
+ UA = 'UA',
}
```

## - Second we need to configure i18n synchronization tool

docs for tool [i18n Sync Tool](scripts/i18n/README.md)

1. `.i18nrc.json` add to config new language

BEFORE

```diff
{
  "poEditor": {
    "apiKey": "<api code>",
    "apiUrl": "https://api.poeditor.com/v2/",
    "projectName": "sh-frontend",
-   "languages": ["en_US", "en_UK", "fr_CA"],
+   "languages": ["en_US", "en_UK", "fr_CA", "uk_UA"],
    "defaultLanguage": "en_US"
  },
  "translationsJsonFolder": "src/i18n/locales"
}
```

2. POEditor specific part (if POEditor is used as i18nSync adapter)

go to main file `scripts/i18n/src/currency.ts` and modify

```diff
const poClient = new PoEditorAdapter(options, {
  pullSpecificLanguage: argv.pullOne,
  POEditorSpecificLanguageCodes: new Map([
    ['en_UK', 'en-gb'],
    ['en_US', 'en-us'],
    ['fr_CA', 'fr-ca'],
+   ['uk_UA', 'uk_ua'],
  ]),
});
```
