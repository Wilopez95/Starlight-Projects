import { gql } from '@apollo/client';
import { useExceededCreditLimitPopup } from './useExceededCreditLimitPopup';
import { useCustomerBalancesQuery } from '../../../graphql/api';
import { isNil } from 'lodash-es';
import { useCallback } from 'react';

gql`
  query customerBalances($id: Int!) {
    haulingCustomer(id: $id) {
      balances {
        availableCredit
      }
    }
  }
`;

export interface CheckForCreditLimitHookOptions {
  customerId: number;
}

export const useCheckForCreditLimit = ({ customerId }: CheckForCreditLimitHookOptions) => {
  const showExceededCreditLimitPopup = useExceededCreditLimitPopup();
  const { data } = useCustomerBalancesQuery({
    variables: { id: customerId },
    skip: !customerId,
  });

  return useCallback(
    async (grandTotal: number, initialGrandTotal: number = 0) => {
      const availableCredit = data?.haulingCustomer.balances?.availableCredit;

      if (isNil(availableCredit)) {
        throw new Error('Failed to get customer balances');
      }

      if (grandTotal > 0 && availableCredit < grandTotal - initialGrandTotal) {
        await showExceededCreditLimitPopup();
      }
    },
    [data?.haulingCustomer.balances?.availableCredit, showExceededCreditLimitPopup],
  );
};
