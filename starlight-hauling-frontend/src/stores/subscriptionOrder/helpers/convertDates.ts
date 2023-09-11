import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IUnFinalizedSubscriptionOrder, JsonConversions } from '@root/types';

export const convertUnFinalizedSubscriptionOrderDates = (
  entity: JsonConversions<IUnFinalizedSubscriptionOrder>,
): IUnFinalizedSubscriptionOrder => ({
  ...entity,
  serviceDate: substituteLocalTimeZoneInsteadUTC(entity.serviceDate),
});
