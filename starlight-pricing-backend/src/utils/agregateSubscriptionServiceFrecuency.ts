import { isEmpty } from 'lodash';
import { ISubscriptionServiceItem } from '../Interfaces/SubscriptionServiceItem';

export const aggregateSubscriptionServiceFrequency = (serviceItems: ISubscriptionServiceItem[]) => {
  const servicingServiceItems = serviceItems.filter(item => item.serviceFrequency);
  // if serviceItem has no`frequency`- it means that it's not `servicing` item
  if (isEmpty(servicingServiceItems)) {
    return null;
  }
  const isAllFrequenciesTheSame = servicingServiceItems.every(
    (item, _, thisArray) => item.serviceFrequency?.[0].id === thisArray[0].serviceFrequency?.[0].id,
  );

  if (isAllFrequenciesTheSame) {
    const [firstItem] = servicingServiceItems;
    return firstItem.serviceFrequency;
  }

  return 'multiple';
};
