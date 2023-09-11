import { OrderCancellationReasonType } from '@root/types';

export const orderCancellationReasonTypeOptions: OrderCancellationReasonType[] = [
  'customerCanceled',
  'duplicateOrder',
  'schedulingError',
  'internalError',
  'other',
];
