import { BillableItemActionEnum, BusinessLineType } from '@root/consts';

import DefaultWorkOrderData from './Default';
import ExtendedWorkOrderData from './Extended';

export const getWorkOrderDataComponent = (
  type?: BillableItemActionEnum,
  haulerId?: number | null,
  businessLineType?: BusinessLineType,
) => {
  if (!type || haulerId) {
    return null;
  }

  switch (type) {
    case BillableItemActionEnum.switch:
    case BillableItemActionEnum.dumpReturn:
    case BillableItemActionEnum.liveLoad:
    case BillableItemActionEnum.reposition:
    case BillableItemActionEnum.relocate:
      return ExtendedWorkOrderData;
    case BillableItemActionEnum.final:
      if (businessLineType === BusinessLineType.commercialWaste) {
        return ExtendedWorkOrderData;
      }

      return DefaultWorkOrderData;

    default:
      return DefaultWorkOrderData;
  }
};
