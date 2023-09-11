import React from 'react';
import { Trans } from '@starlightpro/common/i18n';

import { SubjectRow } from '../../BaseRows';

export const OrderCreated: React.FC = () => {
  return (
    <SubjectRow subject="Order">
      <Trans>created</Trans>
    </SubjectRow>
  );
};
