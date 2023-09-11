import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { useCompanyMeasurementUnits } from '../../../../../../../hooks/useCompanyMeasurementUnits';
import { useTranslation } from '@starlightpro/common/i18n';

type Props = {
  prevValue: string | number;
  newValue: string | number;
  subject: string;
};

export const OrderHistoryMassChanges: React.FC<Props> = ({ prevValue, newValue, subject }) => {
  const { t } = useTranslation();
  const { convertWeights, massTranslation } = useCompanyMeasurementUnits();

  return (
    <DifferenceRow
      subject={t(subject)}
      from={prevValue ? `${convertWeights(prevValue)} ${massTranslation}` : null}
      to={`${convertWeights(newValue)} ${massTranslation}`}
    />
  );
};
