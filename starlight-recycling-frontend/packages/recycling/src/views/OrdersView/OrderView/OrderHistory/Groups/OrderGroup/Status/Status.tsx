import React from 'react';
import { Trans } from '@starlightpro/common/i18n';
import { Box } from '@material-ui/core';
import { isNil } from 'lodash-es';

import { SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';
import { OrderStatus } from '@starlightpro/common/graphql/api';
import { OrderStatusLabel } from '../../../../OrderStatusLabel';

export const OrderHistoryChangeStatus: React.FC<IBaseOrderHistoryChange<
  OrderStatus | 'In_Progress'
>> = ({ newValue, prevValue }) => {
  return (
    <SubjectRow subject="Status">
      <Trans>changed </Trans>
      {!isNil(prevValue) && (
        <>
          <Trans>from</Trans>
          <Box mx={0.5}>
            <OrderStatusLabel status={prevValue} />
          </Box>
        </>
      )}
      {!isNil(newValue) && (
        <>
          <Trans>to</Trans>
          <Box mx={0.5}>
            <OrderStatusLabel status={newValue} />
          </Box>
        </>
      )}
    </SubjectRow>
  );
};
