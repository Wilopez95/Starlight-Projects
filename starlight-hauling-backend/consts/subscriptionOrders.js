import pick from 'lodash/fp/pick.js';

export const TABLE_NAME = 'subscription_orders';

export const getLinkedInputFields = pick([
  'billableServiceId',
  'materialId',
  'globalRatesServicesId',
  'customRatesGroupServicesId',
  'jobSiteContactId',
  'permitId',
  'thirdPartyHaulerId',
  'subscriptionContactId',
  'promoId',
  'customRatesGroupId',
]);

export const serviceItemFieldsForRecurringOrder = [
  'subscriptionId',
  'billableServiceId',
  // 'globalRatesRecurringServicesId', // recurring order can't have own price
  // 'customRatesGroupServicesId', // recurring order can't have own price
  // 'price', // seems that recurring order can't have own price
  'quantity',
  'materialId',
];

export const subscriptionOrderFieldsForWosUpdate = [
  'serviceDate',
  'jobSiteNote',
  'jobSiteContactTextOnly',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'poRequired',
  'permitRequired',
  'signatureRequired',
  'instructionsForDriver',
  'alleyPlacement',
  'highPriority',
  'earlyPick',
  'someoneOnSite',
  'toRoll',
  'thirdPartyHaulerId',
];

export const subscriptionOrderFieldsForWos = [
  'id',
  'status',
  'serviceDate',
  'canReschedule',
  'quantity',
  'jobSiteNote',
  'jobSiteContactTextOnly',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'someoneOnSite',
  'highPriority',
  'instructionsForDriver',
  'earlyPick',
  'toRoll',
  'alleyPlacement',
  'signatureRequired',
  'serviceDayOfWeekRequiredByCustomer',
  'subscriptionServiceItemId',
  'billableServiceId',
  'thirdPartyHaulerId',
  'poRequired',
  'purchaseOrderId',
  'permitRequired',
  'assignedRoute',
  'droppedEquipmentItem',
  'pickedUpEquipmentItem',
];

export const subscriptionsOrderGridFields = ['*'];

export const subscriptionsOrderDetailsFields = ['*'];
