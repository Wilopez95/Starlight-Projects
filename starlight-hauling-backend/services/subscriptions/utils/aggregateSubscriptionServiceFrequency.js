export const aggregateSubscriptionServiceFrequency = serviceItems => {
  const servicingServiceItems = serviceItems.filter(item => item.serviceFrequency);
  // if serviceItem has no`frequency`- it means that it's not `servicing` item
  if (!servicingServiceItems.length) {
    return null;
  }

  const isAllFrequenciesTheSame = servicingServiceItems.every(
    (item, _, thisArray) => item.serviceFrequency.id === thisArray[0].serviceFrequency.id,
  );

  if (isAllFrequenciesTheSame) {
    const [firstItem] = servicingServiceItems;
    return firstItem.serviceFrequency;
  }

  return 'multiple';
};
