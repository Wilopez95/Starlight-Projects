import React from 'react';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';
import { HaulingMaterial } from '../../../../../../../graphql/api';
import { Trans } from '@starlightpro/common/i18n';

export const OrderHistoryMaterialChanges: React.FC<IBaseOrderHistoryChange<
  number | null,
  number | null,
  HaulingMaterial | null
>> = ({ populated, newValue }) => {
  if (!newValue) {
    return (
      <SubjectRow subject="Material">
        <Trans>deleted</Trans>
      </SubjectRow>
    );
  }

  return (
    <DifferenceRow
      subject="Material"
      from={populated.prevValue?.description}
      to={populated.newValue?.description}
    />
  );
};
