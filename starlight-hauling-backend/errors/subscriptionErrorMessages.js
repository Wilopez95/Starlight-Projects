export const invalidCustomerOwnedServiceAction = service =>
  `Service "${service}" uses customer owned equipment and must be on of:
        "None", "General Purpose", "Dump & Return", "Servicing"`;
export const multipleDeliveries = service => `Service "${service}" has multiple deliveries`;
export const invalidDeliveryOrderDate = service =>
  `Order "${service}" must have service date for today or later`;
export const invalidServiceStartDate = service =>
  `Service "${service}" must have start date for today or later`;
export const multipleFinalOrders = service => `Service "${service}" has multiple final orders`;
export const serviceWithoutEndDate = service =>
  `Service "${service}" must have end date because it has final order included`;
export const invalidFinalOrderDate = service =>
  `Order "${service}" must have service date for tomorrow or later`;
export const invalidServiceEndDate = service =>
  `Service "${service}" must have end date for tomorrow or later`;
export const invalidOrderDate = service =>
  `Order "${service}" must have service date for today or later`;
export const missingServiceFrequency = service =>
  `Service "${service}" must have frequency configuration`;
export const globalRatesNotFound = service =>
  `Global rates for billable service "${service}" not found`;
export const noDeliveries = service => `Service "${service}" must have delivery`;
export const notAllowedRecurringService = service =>
  `Can't use Recurring Billable Service "${service}" to create new subscription order`;
export const invalidServiceServiceDate = id =>
  `Service with id: ${id} must have service date for tomorrow or later`;

export const invalidEndDateMessage = "You can't set end date of subscription to the past";
export const invalidDatesPairMessage =
  "You can't set end date of subscription earlier than start date + 1 day";
export const cantChangeStartDateMessage =
  "You can't move start date of already started subscription";
export const cantChangeEndDateMessage = "You can't move end date of already ended subscription";
export const cantUnselectFreqMessage =
  "You can't unselect frequency setting for existing subscription";
export const cantUnselectDaysMessage =
  "You can't drop servicing days of week for existing subscription";
export const creditLimitExceededMessage = 'Credit limit exceeded for on account payment';
export const cantResumeSubscription = subscriptionId =>
  `No subscription with id: ${subscriptionId} or it already resumed`;
export const subscriptionNotFound = subscriptionId =>
  `Subscription with id: ${subscriptionId} does not exist`;
export const bsNotFound = billableServiceId =>
  `Billable Service with id: ${billableServiceId} does not exist`;
export const subOrderNotFound = id => `Subscription Order with id ${id} does not exist`;
