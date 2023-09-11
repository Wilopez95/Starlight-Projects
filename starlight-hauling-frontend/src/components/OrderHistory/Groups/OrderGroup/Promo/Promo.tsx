import React from 'react';

import { IPromo } from '@root/types';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryPromoChanges: React.FC<
  IBaseOrderHistoryChange<number | null, number | null, IPromo | null>
> = ({ newValue, populated }) => {
  if (!newValue) {
    return <SubjectRow subject="Promo">deleted</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject="Promo"
      from={populated.prevValue?.description}
      to={populated.newValue?.description ?? ''}
    />
  );
};
