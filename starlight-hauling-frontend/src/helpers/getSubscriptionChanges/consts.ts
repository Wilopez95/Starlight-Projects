import {
  INewSubscription,
  INewSubscriptionLineItem,
  INewSubscriptionOrder,
  INewSubscriptionService,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const editableSubscriptionProps: (keyof INewSubscription)[] = [
  'jobSiteContactId',
  'orderContactId',
  'purchaseOrderId',
  'permitId',
  'thirdPartyHaulerId',
  'customRatesGroupId',
  'csrComment',
  'startDate',
  'endDate',
  'annualReminderConfig',
  'driverInstructions',
  'bestTimeToCome',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'someoneOnSite',
  'highPriority',
  'promoId',
  'unlockOverrides',
];

export const editableServiceItemProps: (keyof INewSubscriptionService)[] = [
  'billableServiceId',
  'serviceFrequencyId',
  'materialId',
  'quantity',
  'serviceDaysOfWeek',
  'price',
  'unlockOverrides',
];

export const editableLineItemProps: (keyof INewSubscriptionLineItem)[] = [
  'billableLineItemId',
  'quantity',
  'price',
  'unlockOverrides',
];

export const editableSubscriptionOrderProps: (keyof INewSubscriptionOrder)[] = [
  'quantity',
  'price',
  'serviceDate',
  'unlockOverrides',
];
