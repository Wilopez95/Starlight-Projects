import { BusinessLineType } from '@root/consts';

import DefaultWorkOrderData from './Default';
import DeliveryWorkOrderData from './Delivery';
import FinalWorkOrderData from './Final';
import PortableToiletsWorkOrderData from './PortableToilets';
import RelocateWorkOrderData from './Relocate';
import RepositionWorkOrderData from './Reposition';
import GeneralPurposeWorkOrderData from './GeneralPurpose';
import { GetWorkOrderDataComponentOptions } from './types';

export const getWorkOrderDataComponent = ({
  billableItemAction,
  thirdPartyHaulerId,
  businessLineType,
}: GetWorkOrderDataComponentOptions) => {
  if (billableItemAction === undefined || thirdPartyHaulerId) {
    return null;
  }

  if (businessLineType === BusinessLineType.portableToilets) {
    return PortableToiletsWorkOrderData;
  }

  switch (billableItemAction) {
    case 'liveLoad':
      return DefaultWorkOrderData;
    case 'dump&Return':
      return DefaultWorkOrderData;
    case 'switch':
      return DefaultWorkOrderData;
    case 'delivery':
      return DeliveryWorkOrderData;
    case 'final':
      return FinalWorkOrderData;
    case 'reposition':
      return RepositionWorkOrderData;
    case 'relocate':
      return RelocateWorkOrderData;
    case 'generalPurpose':
      return GeneralPurposeWorkOrderData;
    case 'none':
      return DefaultWorkOrderData;

    default:
      return DefaultWorkOrderData;
  }
};
