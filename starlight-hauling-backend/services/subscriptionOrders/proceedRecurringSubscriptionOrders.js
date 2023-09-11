import { canGenerateOrders } from '../subscriptions/utils/canGenerateOrders.js';

import ApiError from '../../errors/ApiError.js';
import { missingServiceFrequency } from '../../errors/subscriptionErrorMessages.js';

import { ACTION } from '../../consts/actions.js';
import { mapRecurringSubscriptionOrderForTemplate } from './utils/mapRecurringSubscriptionOrderForTemplate.js';

export const proceedRecurringSubscriptionOrders = ({
  frequency,
  subscription,
  serviceItem,
  subscriptionService,
  deliveryDate,
  finalDate,
  useEffectiveDate = false,
}) => {
  const templates = [];
  if (!canGenerateOrders(subscription) || subscriptionService.action !== ACTION.service) {
    return templates;
  }
  if (!frequency) {
    throw ApiError.invalidRequest(missingServiceFrequency(subscriptionService.description));
  }

  const template = mapRecurringSubscriptionOrderForTemplate({
    subscription,
    serviceItem,
    useEffectiveDate,
    frequency,
    deliveryDate,
    finalDate,
  });
  templates.push(template);
  return templates;
};
