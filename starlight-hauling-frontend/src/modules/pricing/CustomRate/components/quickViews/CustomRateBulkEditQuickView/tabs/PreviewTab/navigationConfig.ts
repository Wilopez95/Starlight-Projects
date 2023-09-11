import { NavigationConfigItem } from '@starlightpro/shared-components';

import { isCore } from '@root/consts/env';
import { i18n } from '@root/i18n/index';
import { RatesEntityType } from '@root/modules/pricing/const';

import { BulkEditPreviewTab } from '../../types';

const I18N_PATH = 'modules.pricing.Text.';

const AdditionalConfig: NavigationConfigItem<BulkEditPreviewTab>[] = !isCore
  ? [
      {
        index: 2,
        label: i18n.t(`${I18N_PATH}RecurringServices`),
        key: RatesEntityType.recurringService,
      },
      {
        index: 3,
        label: i18n.t(`${I18N_PATH}RecurringLineItems`),
        key: RatesEntityType.recurringLineItem,
      },
    ]
  : [];

export const navigationConfig: NavigationConfigItem<BulkEditPreviewTab>[] = [
  {
    index: 0,
    label: i18n.t(`${I18N_PATH}OneTimeServices`),
    key: RatesEntityType.oneTimeService,
  },
  {
    index: 1,
    label: i18n.t(`${I18N_PATH}LineItems`),
    key: RatesEntityType.oneTimeLineItem,
  },
  ...AdditionalConfig,
];
