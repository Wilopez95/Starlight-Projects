import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

import { Badge } from '@root/common';
import { getColorByStatus } from '@root/helpers';
import { OrderStatusType } from '@root/types';

import { SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryChangeStatus: React.FC<IBaseOrderHistoryChange<OrderStatusType>> = ({
  newValue,
  prevValue,
}) => {
  const prevBadgeColor = getColorByStatus(prevValue);
  const newBadgeColor = getColorByStatus(newValue);

  return (
    <SubjectRow subject="Status">
      change from
      <Layouts.Margin left="1" right="1">
        <Badge color={prevBadgeColor}>{startCase(prevValue)}</Badge>
      </Layouts.Margin>
      to
      <Layouts.Margin left="1" right="1">
        <Badge color={newBadgeColor}>{startCase(newValue)}</Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
