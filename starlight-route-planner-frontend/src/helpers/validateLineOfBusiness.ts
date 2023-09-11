import { partition } from 'lodash-es';

import { BusinessLineType } from '@root/consts';
import { BusinessLineStore } from '@root/stores/businessLine/BusinessLineStore';
import { IRouteItem } from '@root/types';

interface IValidateLineOfBusinessParams<T> {
  presentItems: T[];
  droppedItems: T[];
  businessLineStore: BusinessLineStore;
}

export const validateLineOfBusiness = <T extends IRouteItem>({
  presentItems,
  droppedItems,
  businessLineStore,
}: IValidateLineOfBusinessParams<T>) => {
  const ptBusinessLineChecker = ({ businessLineId }: T) => {
    const lob = businessLineStore.getById(businessLineId);

    return lob?.type === BusinessLineType.portableToilets;
  };

  const [ptItemsPresent, notPtItemsPresent] = partition(presentItems, ptBusinessLineChecker);
  const [ptItemsDropped, notPtItemsDropped] = partition(droppedItems, ptBusinessLineChecker);

  if (!ptItemsPresent.length && !ptItemsDropped.length) {
    return [];
  }

  if (ptItemsPresent.length && ptItemsDropped.length === droppedItems.length) {
    return [];
  }

  if (ptItemsPresent.length && notPtItemsDropped.length) {
    return notPtItemsDropped;
  }

  if (notPtItemsPresent.length && ptItemsDropped.length) {
    return ptItemsDropped;
  }

  return [];
};
