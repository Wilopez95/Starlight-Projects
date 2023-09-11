import { NavigationConfigItem } from '@starlightpro/shared-components';

import { isCore } from '@root/consts/env';
import { i18n } from '@root/i18n/index';

import { BulkEditPreviewTab } from '../../types';

export const I18N_PATH = 'components.forms.Rates.Text.';

const AdditionalConfig: NavigationConfigItem<BulkEditPreviewTab>[] = !isCore
  ? [
      {
        index: 2,
        label: i18n.t(`${I18N_PATH}RecurringServices`),
        key: 'recurringServices',
      },
      {
        index: 3,
        label: i18n.t(`${I18N_PATH}RecurringLineItems`),
        key: 'recurringLineItems',
      },
    ]
  : [];

export const navigationConfig: NavigationConfigItem<BulkEditPreviewTab>[] = [
  {
    index: 0,
    label: i18n.t(`${I18N_PATH}OneTimeServices`),
    key: 'services',
  },
  {
    index: 1,
    label: i18n.t(`${I18N_PATH}LineItems`),
    key: 'lineItems',
  },
  ...AdditionalConfig,
];
