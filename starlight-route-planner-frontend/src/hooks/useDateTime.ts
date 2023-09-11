import { useCallback } from 'react';
import { isDate } from 'lodash-es';

import { IDateTimeFormatComponents } from '@root/i18n/types';
import { useIntl } from '@root/i18n/useIntl';

type DateTimeType = Date | string | null | undefined;

type InputParams = {
  from: DateTimeType;
  to?: DateTimeType;
  format?: keyof IDateTimeFormatComponents;
  defaultValue?: string;
  separator?: string;
};

export const useDateTime = () => {
  const { formatDateTime: _formatDateTime } = useIntl();

  const formatDateTime = useCallback(
    ({ from, to, format = 'time', defaultValue = '', separator = '-' }: InputParams) => {
      const _from = from ? (isDate(from) ? _formatDateTime(from)[format] : from) : defaultValue;

      const _to = to ? (isDate(to) ? _formatDateTime(to)[format] : to) : defaultValue;
      if (!to) {
        return _from;
      }

      return `${_from} ${_from && _to ? separator : ''} ${_to}`;
    },
    [_formatDateTime],
  );

  return { formatDateTime };
};
