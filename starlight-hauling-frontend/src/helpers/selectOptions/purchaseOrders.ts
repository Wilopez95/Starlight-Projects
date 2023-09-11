import { ISelectOption } from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { TFunction } from 'i18next';

import { IDateTimeFormat } from '@root/i18n/types';
import { IPurchaseOrder } from '@root/types';

type PurchaseOrdersToSelectOptionParams = {
  purchaseOrders: IPurchaseOrder[];
  formatDateTime?: IDateTimeFormat;
  t: TFunction;
  selectedPurchaseOrders?: IPurchaseOrder[];
  isOrderRequest?: boolean;
};

const today = endOfToday();

export const purchaseOrdersToSelectOption = ({
  purchaseOrders,
  selectedPurchaseOrders = [],
  isOrderRequest,
  t,
}: PurchaseOrdersToSelectOptionParams): ISelectOption[] => {
  const oldPurchaseOrders = selectedPurchaseOrders.filter(
    order =>
      isOrderRequest || (!order.isOneTime && !purchaseOrders.some(({ id }) => id === order.id)),
  );

  return [...oldPurchaseOrders, ...purchaseOrders].map(
    ({ id, poNumber, expirationDate, active }) => {
      const isActiveAndExpired = active && expirationDate && isAfter(today, expirationDate);

      return {
        label: poNumber,
        value: id,
        ...(expirationDate &&
          active && {
            description: `* ${t(
              `Text.${isActiveAndExpired ? 'Expired' : 'Expire'}`,
            )} ${expirationDate}`,
          }),
        ...(!active && {
          badge: {
            text: t('Text.Inactive'),
            borderRadius: 2,
            color: 'alert',
          },
        }),
        ...(isActiveAndExpired && {
          badge: {
            text: t('Text.Expired'),
            borderRadius: 2,
            color: 'primary',
          },
        }),
      };
    },
  );
};
