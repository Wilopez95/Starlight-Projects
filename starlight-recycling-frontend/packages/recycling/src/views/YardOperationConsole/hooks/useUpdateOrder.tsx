import React, { useCallback } from 'react';
import { Trans } from '../../../i18n';

import { OrderUpdateInput, useUpdateOrderMutation } from '../../../graphql/api';
import { showError, showSuccess } from '../../../components/Toast';

export const useUpdateOrder = () => {
  const [updateOrderMutation] = useUpdateOrderMutation();

  return useCallback(
    async (data: OrderUpdateInput) => {
      try {
        await updateOrderMutation({
          variables: { data },
        });
        showSuccess(<Trans>Order updated successfully!</Trans>);
      } catch (e) {
        showError(<Trans>Could not update order</Trans>);
      }
    },
    [updateOrderMutation],
  );
};
