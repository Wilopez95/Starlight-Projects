import { format } from 'date-fns';
import { isDate } from 'lodash-es';

import { type IRescheduleOrderData } from '@root/components/forms/RescheduleOrder/types';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import {
  INewOrderFormData,
  IOrderSummarySection,
} from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import { INewRecurrentOrderFormData } from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';
import { INewSubscriptionFormData } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  type IConfigurableOrder,
  type IConfigurableSubscription,
  type IConfigurableSubscriptionDraft,
  type IConfigurableSubscriptionOrder,
  type ISubscriptionOrder,
} from '@root/types';

export const formatTime = (
  data:
    | INewOrderFormData
    | INewSubscriptionFormData
    | IRescheduleOrderData
    | IConfigurableOrder
    | ISubscriptionOrder
    | IConfigurableSubscription
    | IConfigurableSubscriptionOrder
    | IConfigurableSubscriptionDraft
    | (INewOrderFormData & Omit<IOrderSummarySection, 'unlockOverrides'>)
    | (INewRecurrentOrderFormData & IOrderSummarySection),
) => {
  const bestTimeToComeFrom = isDate(data.bestTimeToComeFrom)
    ? format(data.bestTimeToComeFrom, dateFormatsEnUS.time24)
    : data.bestTimeToComeFrom;
  const bestTimeToComeTo = isDate(data.bestTimeToComeTo)
    ? format(data.bestTimeToComeTo, dateFormatsEnUS.time24)
    : data.bestTimeToComeTo;

  return { bestTimeToComeFrom, bestTimeToComeTo };
};
