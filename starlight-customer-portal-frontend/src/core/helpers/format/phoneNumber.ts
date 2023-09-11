import { LocaleConfigMap, SupportedLocale } from '@root/core/types/base';

// TODO: use named capturing groups once Firefox supports it in version 78
const localeRegexp: LocaleConfigMap<RegExp> = {
  'en-US': /^(?:(?:\+1|1)?(?: |-)?)?(?:\(([2-9][0-9]{2})\)|([2-9][0-9]{2}))(?: |-)?([2-9][0-9]{2})(?: |-)?([0-9]{4})$/,
};

const countryCode: LocaleConfigMap<string> = {
  'en-US': '1',
};

export const formatPhoneNumber = (
  phoneNumber: string,
  locale: SupportedLocale = 'en-US',
): string | undefined => {
  const match = localeRegexp[locale].exec(phoneNumber);

  if (!match) {
    return;
  }

  if (!match[3] || !match[4] || !(match[1] || match[2])) {
    return;
  }

  return `${countryCode[locale]}-${match[1] ?? match[2]}-${match[3]}-${match[4]}`;
};