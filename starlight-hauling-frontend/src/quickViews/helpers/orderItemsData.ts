import { LineItem, Order } from '@root/stores/entities';
import {
  type IConfigurableOrder,
  type IEntity,
  type IOrderLineItem,
  type IOrderThreshold,
  type ThresholdType,
} from '@root/types';

export const findThresholdIndex = (values: IConfigurableOrder, type: ThresholdType) => {
  return values.thresholds?.findIndex(threshold => threshold.threshold.type === type) ?? -1;
};

export const findThreshold = (values: IConfigurableOrder, type: ThresholdType) => {
  const index = findThresholdIndex(values, type);

  return values.thresholds?.[index];
};

export const getThresholdRateLimit = (threshold: IOrderThreshold) => {
  // TODO: fix this hack after making limit/globalLimit from number to string

  return (
    Number.parseFloat(threshold.customRatesGroupThreshold?.limit?.toString() ?? '0') ||
    Number.parseFloat(threshold.globalRatesThreshold.limit?.toString() ?? '0')
  );
};

export const getOverweightError = (values: IConfigurableOrder): undefined | string => {
  const threshold = findThreshold(values, 'overweight');

  if (!threshold || threshold.quantity <= 0) {
    return undefined;
  }

  return `The weight limit is exceeded by ${threshold.quantity} ton/s`;
};

export const getOverusedError = (values: IConfigurableOrder): undefined | string => {
  const threshold = findThreshold(values, 'usageDays');

  if (!threshold || threshold.quantity <= 0) {
    return undefined;
  }

  const equipmentItemCode = values.workOrder?.pickedUpEquipmentItem;

  return `Equipment #${equipmentItemCode} overused for ${threshold.quantity} days`;
};

export const getDemurrageError = (values: IConfigurableOrder): undefined | string => {
  const threshold = findThreshold(values, 'demurrage');

  if (!threshold || threshold.quantity <= 0) {
    return undefined;
  }

  return `The demurrage limit is exceeded by ${threshold.quantity} minute/s`;
};

export const getDefaultLineItem = (lineItem: LineItem): Omit<IOrderLineItem, keyof IEntity> => ({
  billableLineItemId: lineItem.id,
  billableLineItem: {
    id: lineItem.id,
    originalId: lineItem.id,
    active: lineItem.active,
    oneTime: lineItem.oneTime,
    description: lineItem.description,
    createdAt: lineItem.createdAt,
    updatedAt: lineItem.updatedAt,
    applySurcharges: lineItem.applySurcharges,
    businessLineId: lineItem.businessLineId,
    unit: lineItem.unit,
  },
  quantity: 1,
  units: lineItem.unit,
  customRatesGroupLineItemsId: undefined,
  globalRatesLineItemsId: undefined,
  price: 0,
  applySurcharges: true,
});

export const getThresholdHandlerConfigs = (
  order: Order,
  type: ThresholdType,
): {
  path: string;
  defaultValue: unknown;
} => {
  switch (type) {
    case 'demurrage': {
      return {
        defaultValue: order.workOrder?.startServiceDate,
        path: 'workOrder.startServiceDate',
      };
    }
    // TODO: remove this when adding proper threshold calculation
    case 'dump':
    case 'load':
    case 'overweight': {
      return {
        defaultValue: '0',
        path: 'workOrder.weight',
      };
    }
    case 'usageDays': {
      return {
        defaultValue: order.workOrder?.completionDate,
        path: 'workOrder.completionDate',
      };
    }
    default:
      return { defaultValue: '', path: '' };
  }
};
