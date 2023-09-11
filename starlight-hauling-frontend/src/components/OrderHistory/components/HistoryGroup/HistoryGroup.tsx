import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { parseDate } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { formatHistoryItems } from './helpers';
import { IOrderHistoryGroup } from './types';

export const OrderHistoryGroup: React.FC<IOrderHistoryGroup> = ({ timestamp, historyItems }) => {
  const { formatDateTime } = useIntl();

  const historyItemTime = formatDateTime(parseDate(timestamp)).time;

  const historyItemDate = formatDateTime(parseDate(timestamp)).date;

  const { user } = historyItems[0];

  const data = formatHistoryItems(historyItems);

  if (!data) {
    return null;
  }

  return (
    <Layouts.Margin bottom="2">
      <Typography color="secondary" shade="light">
        {historyItemTime}・{historyItemDate} by {user}
      </Typography>
      <Layouts.Margin top="1" bottom="0.5">
        {data}
      </Layouts.Margin>
    </Layouts.Margin>
  );
};
