# i18n guide

#Language

core framework `i18next` [i18next](https://www.i18next.com/)

To use i18n interpolation (formatting) use `t` function from `useTranslation` hook

User formatting directly in you strings translations

```
{
    "key": "Text that should be translated",
    "key2": "{{text, uppercase}} just uppercased"
}
```

to have access for all config items for current language use hook `useLanguageConfig`

```
import { useLanguageConfig } from '@root/hooks';
import { format } from 'date-fns';

const Comp = ({value}) => {
    const { name } = useLanguageConfig();

    return <div>{name}</div>;
}

```

## Examples

### Uppercase

`t('formats.uppercase', { text: value })`

```
const MyComponent = () => {
    const { t } = useTranslation();

    return (
        <Typography>
            { 't('formats.uppercase', { text: "make me uppecased!" })' }
        </Typography>
    )
```

### translation \*.json structure

To avoid "painful" git merge conflicts follow next structure\
use path ti component folder as key path

For example: you have component in project structure
`src\components\PageHeader`

So you can use next structure in json

```
// json file

...
  "components": {
    "PageHeader": {
      "Text": {
        ...
        "LogOut": "Log Out",
        ...
      },
      "Form": {},
      "Errors": {},
      "ValidationErrors": {}
    },
...
```

Or

path to `src/pages/CustomerContacts`

```
  "pages": {
    "CustomerContacts": {
      "Text": {},
      "Form": {},
      "Errors": {},
      "ValidationErrors": {}
    },
```

Suggested using some abstract keys to provide a bit context about key

```
"Text": {},
"Form": {},
"Errors": {},
"ValidationErrors": {}
```

# Regions

### some values have to be formatted by TimeZone (Date, Phone numbers, currencies)

to have access for all config items for current region use hook `useRegionConfig`

```
import { useRegionConfig } from '@root/hooks';

const Comp = ({phone}) => {
    const { formatPhoneNumber } = useRegionConfig();

    return <div>{formatPhoneNumber(phone)}</div>;
}
```

### formik

to provide i18n functionality for formik config:
convert formik config to function nad pass all what you need

formik Config example

React Component

```
const regionConfig = useRegionConfig();
const { t } = useTranslation();

const formik = useFormik({
    validationSchema: validationSchema(regionConfig, t),
    ...
});

```

Formik config

```
export const validationSchema = ({ validatePhoneNumber }: IRegionConfig, t: TFunction) =>
  Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required(t('Error.FirstName'))
      .max(50, t('Error.Max50')),
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
