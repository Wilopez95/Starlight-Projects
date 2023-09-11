import { useTranslation } from 'react-i18next';

import { isCore } from '@root/consts/env';
import { buildI18Path } from '@root/i18n/helpers';
import { useBusinessContext, useStores } from '@hooks';

import { BillableItemType, NavigationItem } from './types';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.',
);

export const useNavigation = (isRecyclingLoB: boolean): NavigationItem[] => {
  const { t } = useTranslation();
  const { businessLineStore } = useStores();
  const { businessLineId } = useBusinessContext();
  const isRollOff = businessLineStore.isRollOffType(businessLineId);

  if (isCore || isRollOff || isRecyclingLoB) {
    const navItems = [
      {
        index: 0,
        label: isRecyclingLoB
          ? t(`${I18N_PATH.Text}FacilityFee`)
          : t(`${I18N_PATH.Text}OneTimeServices`),
        key: BillableItemType.service,
        subtitle: t(`${I18N_PATH.Text}OneTimeService`),
      },
      {
        index: 1,
        label: t(`${I18N_PATH.Text}LineItems`),
        key: BillableItemType.lineItem,
        subtitle: t(`${I18N_PATH.Text}LineItem`),
      },
      {
        index: 2,
        label: t(`${I18N_PATH.Text}Thresholds`),
        key: BillableItemType.threshold,
        subtitle: t(`${I18N_PATH.Text}Threshold`),
      },
    ];

    if (!isRecyclingLoB) {
      navItems.push({
        index: 3,
        label: t(`${I18N_PATH.Text}Surcharges`),
        key: BillableItemType.surcharge,
        subtitle: t(`${I18N_PATH.Text}Surcharge`),
      });
    }

    return navItems;
  }

  return [
    {
      index: 0,
      label: t(`${I18N_PATH.Text}OneTimeServices`),
      key: BillableItemType.service,
      subtitle: t(`${I18N_PATH.Text}OneTimeService`),
    },
    {
      index: 1,
      label: t(`${I18N_PATH.Text}RecurringServices`),
      key: BillableItemType.recurringService,
      subtitle: t(`${I18N_PATH.Text}RecurringService`),
    },
    {
      index: 2,
      label: t(`${I18N_PATH.Text}LineItems`),
      key: BillableItemType.lineItem,
      subtitle: t(`${I18N_PATH.Text}LineItem`),
    },
    {
      index: 3,
      label: t(`${I18N_PATH.Text}RecurringLineItems`),
      key: BillableItemType.recurringLineItem,
      subtitle: t(`${I18N_PATH.Text}RecurringLineItem`),
    },
    {
      index: 4,
      label: t(`${I18N_PATH.Text}Thresholds`),
      key: BillableItemType.threshold,
      subtitle: t(`${I18N_PATH.Text}Threshold`),
    },
    {
      index: 5,
      label: t(`${I18N_PATH.Text}Surcharges`),
      key: BillableItemType.surcharge,
      subtitle: t(`${I18N_PATH.Text}Surcharge`),
    },
  ];
};
