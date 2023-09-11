export const calcOrdersTotal = prorationInfo =>
  prorationInfo.reduce(
    (ordersTotal, { serviceItemProrationInfo }) =>
      ordersTotal +
      serviceItemProrationInfo.reduce(
        (subscriptionOrdersTotal, { subscriptionOrdersSort }) =>
          subscriptionOrdersTotal +
          (subscriptionOrdersSort?.reduce(
            (total, { price, quantity }) => price * quantity + total,
            0,
          ) ?? 0),
        0,
      ),
    0,
  );
