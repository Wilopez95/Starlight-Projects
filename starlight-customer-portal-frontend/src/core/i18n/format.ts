import { FormatFunction } from 'i18next';

import { isString } from '@root/core/i18n/helpers';
import { InterpolationTags } from '@root/core/i18n/types';

export const formatInterpolations: FormatFunction = (value, tag /* lng */) => {
  if (isString(value) && tag === InterpolationTags.Uppercase) {
    return value.toUpperCase();
  }

  return value as string;
};
