import { REASON_TYPE } from '../../../../../../consts/cancelReasons.js';

export const cancelPtOrderInputDefault = {
  reasonType: REASON_TYPE.customerCanceled,
  comment: 'PT cancellation comment',
  addTripCharge: true,
};

export const cancelRoOrderInputDefault = {
  reasonType: REASON_TYPE.customerCanceled,
  comment: 'RO cancellation comment',
  addTripCharge: true,
};
