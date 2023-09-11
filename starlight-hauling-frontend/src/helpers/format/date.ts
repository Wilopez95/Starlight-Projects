import { useIntl } from '@root/i18n/useIntl';

export const useDateIntl = () => {
  const { formatDateTime, dateFormat: intlDateFormat } = useIntl();
  const dateFormat = intlDateFormat.date;

  const formatDate = (date: Date) => formatDateTime(date).date;

  return { formatDate, dateFormat };
};
