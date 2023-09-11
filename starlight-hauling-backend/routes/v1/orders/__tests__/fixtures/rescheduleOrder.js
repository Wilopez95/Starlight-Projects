import { serviceInputCommonFieldsPtDefault, serviceInputCommonFieldsRoDefault } from './common.js';
import { updatedPtOrderDate, updatedRoOrderDate } from './updateOrders.js';

export const reschedulePtOrderInputDefault = {
  serviceDate: updatedPtOrderDate.toISOString(),
  bestTimeToComeFrom: serviceInputCommonFieldsPtDefault.bestTimeToComeFrom,
  bestTimeToComeTo: serviceInputCommonFieldsPtDefault.bestTimeToComeTo,
  comment: 'PT reschedule comment',
  addTripCharge: true,
};

export const rescheduleRoOrderInputDefault = {
  serviceDate: updatedRoOrderDate.toISOString(),
  bestTimeToComeFrom: serviceInputCommonFieldsRoDefault.bestTimeToComeFrom,
  bestTimeToComeTo: serviceInputCommonFieldsRoDefault.bestTimeToComeTo,
  comment: 'RO reschedule comment',
  addTripCharge: true,
};
