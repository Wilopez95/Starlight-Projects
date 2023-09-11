import { compareAsc, isWithinInterval } from 'date-fns';

const getSubscriptionOrdersInPeriod = ({ periodFrom, periodTo, subscriptionOrders = [] } = {}) => {
  const subscriptionOrdersInPeriod = subscriptionOrders
    .sort(compareAsc)
    .filter(({ serviceDate }) => {
      try {
        return isWithinInterval(serviceDate, {
          start: periodFrom,
          end: periodTo,
        });
      } catch {
        return false;
      }
    })
    .map(order => {
      order.price = order.price ? Number(order.price) : 0;
      order.totalPrice = order.quantity * order.price;

      return order;
    });

  const subscriptionOrdersTotal = subscriptionOrdersInPeriod.reduce(
    (total, { totalPrice }) => totalPrice + total,
    0,
  );

  return {
    subscriptionOrdersTotal,
    subscriptionOrdersInPeriod,
  };
};

export default getSubscriptionOrdersInPeriod;
