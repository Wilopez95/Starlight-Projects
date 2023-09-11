import { FREQUENCY_TYPE } from '../../../../consts/frequencyTypes.js';

export const validateTemplate = (ctx, { template, serviceDaysOfWeek }) => {
  if (
    !template.startDate ||
    !template.frequencyType ||
    !template.frequencyOccurrences ||
    (template.frequencyType === FREQUENCY_TYPE.xPerWeek &&
      (!template.serviceDaysOfWeek ||
        Object.keys(serviceDaysOfWeek).length < template.frequencyOccurrences))
  ) {
    ctx.logger.warn(`
            Failed to generate Subscription Orders for
            Subscription Service Item # ${template.subscriptionServiceItemId}
            of Subscription # ${template.subscriptionId}
            due to invalid service configuration
        `);
    return false;
  }
  return true;
};
