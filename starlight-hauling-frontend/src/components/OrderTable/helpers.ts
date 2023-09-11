import { OrderStatusRoutes } from '@root/consts';
import { OrderStoreStatusType } from '@root/types';

export const isSelectableStatus = (status: OrderStoreStatusType) => {
  return status === 'approved' || status === 'completed';
};

const routesParams = [
  OrderStatusRoutes.Completed,
  OrderStatusRoutes.Approved,
  OrderStatusRoutes.Finalized,
  OrderStatusRoutes.Invoiced,
];

const defaultRoutesParams = [...routesParams, OrderStatusRoutes.InProgress];

const recyclingRoutesParams = [...routesParams, OrderStatusRoutes.All];

export const validateOrderStatusParams = (status: OrderStoreStatusType, isRecycling: boolean) => {
  return (isRecycling ? recyclingRoutesParams : defaultRoutesParams).includes(
    status as OrderStatusRoutes,
  );
};
