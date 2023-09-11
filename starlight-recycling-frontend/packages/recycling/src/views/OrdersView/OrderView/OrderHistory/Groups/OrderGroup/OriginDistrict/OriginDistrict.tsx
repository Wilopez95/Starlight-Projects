import React from 'react';
import { HaulingOriginDistrict } from '../../../../../../../graphql/api';
import { useTranslation } from '../../../../../../../i18n';
import { DifferenceRow, SubjectRow } from '../../BaseRows';

import { IBaseOrderHistoryChange } from '../../types';

interface IOrderHistoryOriginDistrictChanges
  extends IBaseOrderHistoryChange<HaulingOriginDistrict | null, HaulingOriginDistrict | null> {}

const format = (v: Pick<IOrderHistoryOriginDistrictChanges, 'populated'>) =>
  v
    ? Object.values(v)
        .filter(Boolean)
        .map((s, i, arr) => (i + 1 === arr.length ? s : `${s},`))
        .join(' ')
    : null;

export const OrderHistoryOriginDistrictChanges: React.FC<IOrderHistoryOriginDistrictChanges> = ({
  newValue,
  populated,
}) => {
  const { t } = useTranslation();

  if (!newValue) {
    return <SubjectRow subject={'Origin District'}>{t('deleted')}</SubjectRow>;
  }

  const [prevDisrt, newDistr] = [format(populated.prevValue), format(populated.newValue)];

  return <DifferenceRow subject="Origin District" from={prevDisrt} to={newDistr} />;
};
