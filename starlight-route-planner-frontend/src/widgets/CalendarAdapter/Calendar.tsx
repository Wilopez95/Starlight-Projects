import React, { useCallback } from 'react';
import { Calendar, ICalendar } from '@starlightpro/shared-components';

import { useIntl } from '@root/i18n/useIntl';

type ICalendarAdapter = Omit<ICalendar, 'dateFormat'> & { dateFormat?: string };

export const CalendarAdapter: React.FC<ICalendarAdapter> = props => {
  const { dateFormat, formatDateTime } = useIntl();

  const formatDate = useCallback((date: Date) => formatDateTime(date).date, [formatDateTime]);

  return <Calendar dateFormat={dateFormat.date} formatDate={formatDate} {...props} />;
};
