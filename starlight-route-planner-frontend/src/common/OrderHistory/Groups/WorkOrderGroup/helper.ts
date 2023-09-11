import { TFunction } from 'i18next';
import { upperFirst } from 'lodash-es';

import { AvailableWorkOrderHistoryAttributes } from '@root/types';

const I18N_PATH_ROOT = 'Text.';

export const getSubjectMap = (
  t: TFunction,
  key: keyof typeof AvailableWorkOrderHistoryAttributes,
) => {
  return t(`${I18N_PATH_ROOT}${upperFirst(key)}`);
};
