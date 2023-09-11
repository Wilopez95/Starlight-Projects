import { logger } from '../../../utils/logger.js';

import { ERROR_MESSAGES } from '../../../errors/errorMessages.js';
import ApiError from '../../../errors/ApiError.js';
import { invalidCustomerOwnedServiceAction } from '../../../errors/subscriptionErrorMessages.js';

import { ACTION } from '../../../consts/actions.js';

export const validateServiceItemInput = (
  serviceItem,
  subscriptionService,
  skipInsertServiceItems,
  subscriptionBillableServicesMap,
) => {
  const isServicingServiceItem =
    !skipInsertServiceItems &&
    subscriptionBillableServicesMap[serviceItem.billableServiceId].action === ACTION.service;

  logger.debug(
    isServicingServiceItem,
    'subsServiceItemsService->validateServiceItemInput->isServicingServiceItem',
  );

  if (isServicingServiceItem) {
    if (!serviceItem.serviceFrequencyId) {
      throw ApiError.invalidRequest(ERROR_MESSAGES.FREQUENCY_REQUIRED);
    }
  }

  if (
    !skipInsertServiceItems &&
    subscriptionService.equipmentItem.customerOwned &&
    ![ACTION.none, ACTION.generalPurpose, ACTION.dumpReturn, ACTION.service].includes(
      subscriptionService.action,
    )
  ) {
    throw ApiError.invalidRequest(
      invalidCustomerOwnedServiceAction(subscriptionService.description),
    );
  }
};
