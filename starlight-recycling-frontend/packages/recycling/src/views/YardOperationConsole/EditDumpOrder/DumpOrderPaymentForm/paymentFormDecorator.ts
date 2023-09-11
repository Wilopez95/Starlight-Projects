import createDecorator from 'final-form-calculate';
import { PaymentMethodType } from '../../../../graphql/api';
import i18n from '../../../../i18n';
import { mathRound2 } from '../../../../utils/mathRound';
import { setIn } from 'final-form';
import { isNumber, isUndefined } from 'lodash-es';

export const paymentFormDecorator = createDecorator(
  {
    field: 'paymentMethod',
    updates: {
      amount: (value: PaymentMethodType, allValues: any) => {
        if (value === PaymentMethodType.Cash) {
          return i18n.t('{{value, number}}', { value: 0 });
        }

        return allValues.grandTotal;
      },
    },
  },
  {
    field: 'grandTotal',
    updates: {
      amount: (value: number, allValues: any) => {
        if (allValues.paymentMethod === PaymentMethodType.Cash) {
          return allValues.amount;
        }

        const newValue = mathRound2(value);

        if (isNaN(newValue)) {
          return value;
        }

        return newValue;
      },
    },
  },
  {
    field: /billableItems\[\d+\].(price|quantity)/,
    updates: (value: any, name, allValues: any) => {
      if (isUndefined(value)) {
        return allValues;
      }

      if (isNaN(value)) {
        return setIn(allValues, name, 0);
      }

      if (isNumber(value) && value > Number.MAX_SAFE_INTEGER) {
        return setIn(allValues, name, Number.MAX_SAFE_INTEGER);
      }

      return allValues;
    },
  },
);
