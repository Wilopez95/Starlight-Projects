import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';

import { purchaseOrdersToSelectOption } from '@root/helpers';
import { useStores } from '@root/hooks/useStores';
import { useIntl } from '@root/i18n/useIntl';
import { IPurchaseOrder } from '@root/types';

interface IFetchAndCreatePONumbers {
  customerId?: number;
  selectedPurchaseOrders?: IPurchaseOrder[];
  isOrderRequest?: boolean;
}

export const useFetchAndCreatePONumbers = ({
  customerId,
  selectedPurchaseOrders,
  isOrderRequest = false,
}: IFetchAndCreatePONumbers) => {
  const { purchaseOrderStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  useEffect(() => {
    purchaseOrderStore.cleanup();
    if (customerId) {
      purchaseOrderStore.getOptions({ customerId });
    }
  }, [purchaseOrderStore, customerId]);

  const purchaseOrderOptions: ISelectOption[] = useMemo(
    () =>
      purchaseOrdersToSelectOption({
        t,
        formatDateTime,
        selectedPurchaseOrders,
        purchaseOrders: purchaseOrderStore.values,
        isOrderRequest,
      }),
    [t, formatDateTime, selectedPurchaseOrders, purchaseOrderStore.values, isOrderRequest],
  );

  const handleCreatePurchaseOrder = useCallback(
    (data: IPurchaseOrder) => {
      purchaseOrderStore.create({
        ...data,
        customerId: String(customerId),
      });
    },
    [purchaseOrderStore, customerId],
  );

  return { purchaseOrderOptions, handleCreatePurchaseOrder };
};
