import React from 'react';
import { useTranslation } from 'react-i18next';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryLineItemTypeChanges } from './types';

export const OrderHistoryLineItemTypeChanges: React.FC<IOrderHistoryLineItemTypeChanges> = ({
  populated,
}) => {
  const { t } = useTranslation();

  return (
    <DifferenceRow
      subject={t('Line Item')}
      from={populated?.prevValue?.description}
      to={populated?.newValue?.description}
    />
  );
};
