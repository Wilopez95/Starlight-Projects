import { capitalize } from 'lodash-es';

import { BillableLineItemUnitTypeEnum } from '@root/consts';
import { Units } from '@root/i18n/config/units';

export const getUnitLabel = (unit?: BillableLineItemUnitTypeEnum, companyUnit?: Units) => {
  if (companyUnit === Units.metric) {
    if (unit === BillableLineItemUnitTypeEnum.TON) {
      return 'Tonne';
    }
    if (unit === BillableLineItemUnitTypeEnum.YARD) {
      return 'Meter';
    }
  }

  return capitalize(unit);
};
