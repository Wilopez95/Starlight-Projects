import ApiError from '../../errors/ApiError.js';
import { invalidOrderDate } from '../../errors/subscriptionErrorMessages.js';
import { mapOneTimeSubscriptionOrderForTemplate } from './utils/mapOneTimeSubscriptionOrderForTemplate.js';

export const proceedOneTimeSubscriptionOrders = ({
  subscription,
  serviceItem,
  idx,
  today,
  subscriptionOrdersInputMap,
  oneTimeBillableServicesMap,
}) => {
  const preparedInput = [];
  if (subscriptionOrdersInputMap[idx]) {
    subscriptionOrdersInputMap[idx].forEach(subscriptionOrderInput => {
      if (subscriptionOrderInput.serviceDate < today) {
        throw ApiError.invalidRequest(
          invalidOrderDate(
            oneTimeBillableServicesMap[subscriptionOrderInput.billableServiceId].description,
          ),
        );
      }
    });

    preparedInput.push(
      ...subscriptionOrdersInputMap[idx].map(item =>
        mapOneTimeSubscriptionOrderForTemplate(subscription, serviceItem, item),
      ),
    );
  }
  return preparedInput;
};
