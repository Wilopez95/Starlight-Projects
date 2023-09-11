import { startCase } from 'lodash-es';
import { IOrderHistoryItem } from '../../../types';

export const getRefundTypeValue = (historyItem: IOrderHistoryItem) => {
  const refundTypeChange = historyItem.changes.find((x) => x.attribute === 'refundType');

  const refundType = refundTypeChange?.newValue ?? '';

  switch (refundType) {
    case 'check': {
      const checkNumberChange = historyItem.changes.find(
        (x) => x.attribute === 'refundCheckNumber',
      );

      const checkNumber: string = checkNumberChange?.newValue;

      return `check #${checkNumber ?? ''}`;
    }

    default:
      return startCase(refundType);
  }
};
