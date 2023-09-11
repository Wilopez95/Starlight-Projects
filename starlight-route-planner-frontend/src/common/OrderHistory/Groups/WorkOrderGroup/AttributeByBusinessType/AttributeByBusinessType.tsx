import React from 'react';
import { observer } from 'mobx-react-lite';

import { BusinessLineType } from '@root/consts';
import { useStores } from '@root/hooks';
import { AvailableWorkOrderHistoryAttributes } from '@root/types';

import { CommonAttribute } from '../CommonAttribute/CommonAttribute';
import { WorkOrderHistoryChanges } from '../types';

export const AttributeByBusinessType: React.FC<WorkOrderHistoryChanges> = observer(
  ({ attribute, actualChanges }) => {
    const { workOrderHistory } = useStores();
    const businessLineType = workOrderHistory.workOrderType;
    const isCommertial = businessLineType === BusinessLineType.commercialWaste;
    const isResidential = businessLineType === BusinessLineType.residentialWaste;

    if (
      isCommertial &&
      (attribute === AvailableWorkOrderHistoryAttributes.permitRequired ||
        attribute === AvailableWorkOrderHistoryAttributes.toRoll)
    ) {
      return null;
    }

    if (
      isResidential &&
      (attribute === AvailableWorkOrderHistoryAttributes.signatureRequired ||
        attribute === AvailableWorkOrderHistoryAttributes.permitRequired ||
        attribute === AvailableWorkOrderHistoryAttributes.someoneOnSite ||
        attribute === AvailableWorkOrderHistoryAttributes.toRoll)
    ) {
      return null;
    }

    return <CommonAttribute attribute={attribute} actualChanges={actualChanges} />;
  },
);
