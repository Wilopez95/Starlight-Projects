import { ACTION } from '../../../consts/actions.js';

export const isDeliverable = subscriptionService =>
  !subscriptionService.equipmentItem.customerOwned &&
  [ACTION.rental, ACTION.service].includes(subscriptionService.action);
