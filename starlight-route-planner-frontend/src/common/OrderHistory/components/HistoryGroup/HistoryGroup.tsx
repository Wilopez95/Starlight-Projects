import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { parseDate } from '@root/helpers';
import { useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { IDailyRouteOrderHistory, IWorkOrderHistory } from '@root/types';
import { formatHistoryItems } from './helpers';

const I18N_ROOT_PATH = 'Text.';

interface IHistoryItem {
  historyItem: IDailyRouteOrderHistory | IWorkOrderHistory;
}

//const OrderHistoryGroup = (historyItem: IDailyRouteHistory | IWorkOrderHistory) => {

const OrderHistoryGroup: React.FC<IHistoryItem> = ({ historyItem }) => {
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const { timeZone } = useTimeZone();

  const dateTime = formatDateTime(parseDate(historyItem.timestamp), {
    timeZone,
  }).history;

  const user = historyItem.userName;

  const data = formatHistoryItems(historyItem);

  if (!data) {
    return null;
  }

  return (
    <Layouts.Margin bottom="2">
      <Typography color="secondary" shade="desaturated">
        {t(`${I18N_ROOT_PATH}HistoryTitle`, { dateTime, user })}
      </Typography>
      <Layouts.Margin top="1" bottom="0.5">
        {data}
      </Layouts.Margin>
    </Layouts.Margin>
  );
};

export default OrderHistoryGroup;
