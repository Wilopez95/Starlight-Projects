import React, { useMemo } from 'react';
import { isNil } from 'lodash-es';
import { HaulingPriceGroup } from '../../../../../../../graphql/api';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryPriceGroupChanges: React.FC<IBaseOrderHistoryChange<
  HaulingPriceGroup | null,
  HaulingPriceGroup | null
>> = ({ prevValue, populated }) => {
  const getGroups = useMemo(() => {
    if (isNil(prevValue)) {
      return [null, populated.newValue?.description];
    }

    const prev = populated.prevValue?.description;
    const updated = populated.newValue?.description;

    return [prev, updated];
  }, [populated.newValue?.description, populated.prevValue?.description, prevValue]);

  const [prevGroup, newGroup] = getGroups;

  return <DifferenceRow subject="Price Group" from={prevGroup} to={newGroup} />;
};
