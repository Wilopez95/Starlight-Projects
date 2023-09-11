import { isNil } from 'lodash-es';
import i18n from '../../../../../../../i18n';

import { ChangeFormat } from './types';

export const formatValue = (value: string | number | undefined, formatVariant?: ChangeFormat) => {
  if (isNil(value)) {
    return;
  }

  if (isNil(formatVariant)) {
    return value;
  }

  switch (formatVariant) {
    case 'id': {
      return `#${value}`;
    }
    case 'money': {
      return i18n.format(+value);
    }
    case 'date': {
      return i18n.format(value);
    }
  }
};
