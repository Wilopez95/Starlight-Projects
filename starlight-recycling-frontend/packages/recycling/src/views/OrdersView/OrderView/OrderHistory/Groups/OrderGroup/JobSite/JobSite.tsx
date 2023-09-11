import React from 'react';
import { HaulingJobSite } from '../../../../../../../graphql/api';
import { useTranslation } from '../../../../../../../i18n';
import { DifferenceRow, SubjectRow } from '../../BaseRows';

import { IBaseOrderHistoryChange } from '../../types';

interface IOrderHistoryJobSiteChanges
  extends IBaseOrderHistoryChange<number | null, number | null, HaulingJobSite> {}

export const OrderHistoryJobSiteChanges: React.FC<IOrderHistoryJobSiteChanges> = ({
  newValue,
  populated,
}) => {
  const { t } = useTranslation();

  if (!newValue) {
    return <SubjectRow subject={'Job Site'}>{t('deleted')}</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject="Job Site"
      from={populated.prevValue ? populated.prevValue.fullAddress : null}
      to={populated.newValue.fullAddress}
    />
  );
};
