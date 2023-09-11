import React from 'react';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';
import { HaulingProject } from '../../../../../../../graphql/api';
import { Trans } from '@starlightpro/common/i18n';

export const OrderHistoryProjectChanges: React.FC<IBaseOrderHistoryChange<
  number | null,
  number | null,
  HaulingProject | null
>> = ({ newValue, populated }) => {
  if (!newValue) {
    return (
      <SubjectRow subject="Project">
        <Trans>deleted</Trans>
      </SubjectRow>
    );
  }

  return (
    <DifferenceRow
      subject="Project"
      from={populated.prevValue?.description}
      to={populated.newValue!.description}
    />
  );
};
