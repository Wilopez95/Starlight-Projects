import { startCase } from 'lodash-es';

import { IntlConfig } from '@root/i18n/types';
import { IOrderHistoryItem } from '@root/types';

import { formatValue } from '../../BaseRows/DifferenceRow/helpers';

export const getRefundTypeValue = (historyItem: IOrderHistoryItem, intl: IntlConfig) => {
  const refundTypeChange = historyItem.changes.find(x => x.attribute === 'refundType');

  const refundType = (refundTypeChange?.newValue as string) ?? '';

  switch (refundType) {
    case 'check': {
      const checkNumberChange = historyItem.changes.find(x => x.attribute === 'refundCheckNumber');

      const checkNumber = checkNumberChange?.newValue as string;

      return `check ${formatValue(checkNumber, intl, 'id') ?? ''}`;
    }

    default:
      return startCase(refundType);
  }
};
