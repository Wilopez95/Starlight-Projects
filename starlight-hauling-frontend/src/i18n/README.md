# i18n

## Table of contents

- [Language](#language)
- [Examples](#examples)
  - [Uppercase](#uppercase)
  - [Translation File JSON Structure](#translation-file-json-structure)
- [Region Examples](#region-examples)
  - [Format Dates](#format-dates)
    - [UTC](#utc)
    - [Timezone](#timezone)
    - [Custom Timezone](#custom-timezone)
    - [Local Time](#local-time)
  - [Formik](#development)
  - [Localized Currency Symbol](#localized-currency-symbol)
- [Adding a New Language](#adding-a-new-language)

## Language

Core framework for locales is `i18next` [i18next](https://www.i18next.com/)

To use i18n interpolation (formatting) use `t` function from `useTranslation` hook

User formatting directly in you strings translations

```json
{
  "key": "Text that should be translated",
  "key2": "{{text, uppercase}} just uppercased"
}
```

to have access for all config items for current language use hook `useLanguageConfig`

```typescript
import { useIntl } from '@root/i18n/useIntl';

const Comp = ({ value }) => {
  const { name } = useIntl();

  return <div>{name}</div>;
};
```

## Examples

### Uppercase

`t('formats.uppercase', { text: value })`

```tsx
const MyComponent = () => {
  const { t } = useTranslation();

  return <Typography>{t('formats.uppercase', { text: 'make me uppecased!' })}</Typography>;
};
```

### Translation File JSON Structure

To avoid "painful" git merge conflicts follow next structure\
use path to component folder as key path

For example: you have component in project structure `src\components\PageHeader`

So you can use next structure in json

```json
{
  "components": {
    "PageHeader": {
      "Text": {
        "LogOut": "Log Out"
      },
      "Form": {},
      "Errors": {},
      "ValidationErrors": {}
    }
  }
}
```

Or

path to `src/pages/CustomerContacts`

```json
{
  "pages": {
    "CustomerContacts": {
      "Text": {},
      "Form": {},
      "Errors": {},
      "ValidationErrors": {}
    }
  }
}
```

Suggested using some abstract keys to provide a bit context about key

```json
{
  "Text": {},
  "Form": {},
  "Errors": {},
  "ValidationErrors": {}
}
```

According to format you can use helper `buildI18Path`

buildI18Path API

```tsx
interface IBuildI18Path {
  Text: string;
  Form: string;
  Errors: string;
  ValidationErrors: string;
}
```

```tsx
const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.CompanySettings.components.Mailing.',
);

// example usage
const Comp = () => <span>{t(`${I18N_PATH.Text}SomeKey`)}</span>;

const Comp2 = () => <span>{t(`${I18N_PATH.Errors}SomeKey`)}</span>;
```

to use this helper naming convention have to be followed as described above

## Region Examples

some values have to be formatted by TimeZone (Date, Phone numbers, currencies)

### Format Dates

#### UTC

```tsx
import { useIntl } from '@root/i18n/useIntl';

const Comp = () => {
  const { formatDateTime } = useIntl();

  return <span>{formatDateTime(date).date}</span>;
};
```

### Timezone

by default date will be formated as `UTC` date without `Local Time` offset

#### Custom Timezone

e.g BU timezone

```tsx
import { useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

const Comp = () => {
  const { timeZone } = useTimeZone();
  const { formatDateTime } = useIntl();

  return <span>{formatDateTime(date, { timeZone }).date}</span>;
};
```

#### Local Time

to format in local time you can use date-fns's format directly or

```tsx
import { useIntl } from '@root/i18n/useIntl';

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const Comp = () => {
  const { formatDateTime } = useIntl();

  return <span>{formatDateTime(date, { timeZone: localTimeZone }).time}</span>;
};
```

formatDateTime returns `IDateTimeFormatComponents` so you can format by this API

```ts
export interface IDateTimeFormatComponents {
  time: string;
  time24: string;
  date: string;
  dateDefault: string;
  dateTZ: string;
  dateTime: string;
  ISO: string;
}
```

in `en_US` for example values will be next:

```ts
export const dateFormatsEnUS: IDateTimeFormatComponents = {
  time: 'h:mm a',
  time24: 'HH:mm',
  date: 'dd MMM, yyyy',
  dateDefault: 'yyyy-MM-dd',
  dateTZ: 'yyyy-MM-dd HH:mm:ss+hh:mm',
  dateTime: 'dd MMM, yyyy, h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
};
```

to have access for all config items for current region use hook `useIntl`

```tsx
import { useIntl } from '@root/i18n/useIntl';

const Comp = ({ phone }) => {
  const { formatPhoneNumber } = useIntl();

  return <div>{formatPhoneNumber(phone)}</div>;
};
```

#### Formik

To provide i18n functionality for Formik config: convert Formik config to function and pass all what
you need

Formik Config example

React Component

```typescript
import { useIntl } from '@root/i18n/useIntl';
import { useTranslation } from 'react-i18next';

const intl = useIntl();
const { t } = useTranslation();

const formik = useFormik({
  validationSchema: validationSchema(intl, t),
});
```

Formik config

```typescript
import { IntlConfig } from '@root/i18n/types';
import { TFunction } from 'i18next';

export const validationSchema = ({ validatePhoneNumber }: IntlConfig, t: TFunction) =>
  Yup.object().shape({
    firstName: Yup.string().trim().required(t('Error.FirstName')).max(50, t('Error.Max50')),
    phoneNumbers: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        number: Yup.string()
          .ensure()
          .test('mobile', t('Error.Phone'), (value?: Maybe<string>) => {
            return !!value && validatePhoneNumber(value);
          }),
        extension: Yup.string()
          .matches(/^[0-9]{4}$/, t('Error.Pattern'))
          .nullable(),
      }),
    ),
  });
```

#### Localized Currency Symbol

In some cases currency symbol should be rendered in text

```tsx
import { useIntl } from '@root/i18n/useIntl';

const Comp = () => {
  const { currencySymbol } = useIntl();

  return <span>{t('Text.Amount', { currencySymbol })}</span>;
};
```

```json
{
  "Text": {
    "Amount": "Amount {{currencySymbol}}"
  }
}
```

## Adding a New Language

add new language [guide](GUIDE.md)
