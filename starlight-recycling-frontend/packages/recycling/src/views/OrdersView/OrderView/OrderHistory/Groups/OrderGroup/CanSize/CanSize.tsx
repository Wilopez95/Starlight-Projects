import React from 'react';
import { Equipment } from '../../../../../../../graphql/api';
import { useTranslation } from '../../../../../../../i18n';
import { DifferenceRow, SubjectRow } from '../../BaseRows';

import { IBaseOrderHistoryChange } from '../../types';

interface IOrderHistoryCanSizeChanges
  extends IBaseOrderHistoryChange<number | null, number | null, Equipment> {}

export const OrderHistoryCanSizeChanges: React.FC<IOrderHistoryCanSizeChanges> = ({
  newValue,
  populated,
}) => {
  const { t } = useTranslation();

  if (!newValue) {
    return <SubjectRow subject={'Can Size'}>{t('deleted')}</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject="Can Size"
      from={populated.prevValue ? populated.prevValue.description : null}
      to={populated.newValue.description}
    />
  );
};
