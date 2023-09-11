import React from 'react';
import { OrderImage } from '../../../../../../../graphql/api';
import { useTranslation } from '../../../../../../../i18n';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

interface IOrderHistoryMediaChanges
  extends IBaseOrderHistoryChange<OrderImage[] | null, OrderImage[] | null> {}

export const OrderHistoryMediaChanges: React.FC<IOrderHistoryMediaChanges> = ({
  prevValue,
  newValue,
}) => {
  const { t } = useTranslation();

  if (!newValue) {
    return <SubjectRow subject={'Attached Media Files'}>{t('deleted')}</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject={'Attached Media Files'}
      from={prevValue ? prevValue.length : null}
      to={newValue ? newValue.length : null}
    />
  );
};
