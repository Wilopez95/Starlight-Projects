import isEmpty from 'lodash/isEmpty.js';

import { ERROR_MESSAGES } from '../../../errors/errorMessages.js';
import ApiError from '../../../errors/ApiError.js';

import { FREQUENCY_TYPE } from '../../../consts/frequencyTypes.js';

export const validateCorrectServiceDaysRegardingFrequency = (serviceDaysOfWeek, frequency) => {
  const generateInvalidServicingDaysOfWeekErrorDetails = (days, times) =>
    `servicing days quantity = ${days}, but frequency.times = ${times}`;

  if (frequency?.type === FREQUENCY_TYPE.xPerWeek) {
    if (!frequency.times) {
      throw ApiError.invalidRequest(ERROR_MESSAGES.INVALID_FREQUENCY_CONFIGURATION);
    }

    if (isEmpty(serviceDaysOfWeek)) {
      throw ApiError.invalidRequest(ERROR_MESSAGES.SERVICING_DAYS_REQUIRED);
    }

    const serviceDaysOfWeekQuantity = Object.keys(serviceDaysOfWeek).length;

    if (serviceDaysOfWeekQuantity !== frequency.times) {
      throw ApiError.invalidRequest(
        ERROR_MESSAGES.INVALID_SERVICING_DAYS_OF_WEEK_CONFIGURATION,
        generateInvalidServicingDaysOfWeekErrorDetails(serviceDaysOfWeekQuantity, frequency.times),
      );
    }
  }
};
