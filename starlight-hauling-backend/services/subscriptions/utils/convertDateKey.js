export const convertDateKey = proration => {
  const { prorationInfo, ...prorationRest } = proration;

  const changedProration = prorationInfo.map(prorationArray =>
    prorationArray.map(prorationPeriod => {
      const { lineItemsProrationInfo = [], serviceItemProrationInfo, ...rest } = prorationPeriod;

      return {
        lineItemsProrationInfo: lineItemsProrationInfo.map(item => {
          const { since, from, ...lineItemRest } = item;
          return {
            periodFrom: since,
            periodTo: from,
            ...lineItemRest,
          };
        }),
        serviceItemProrationInfo: serviceItemProrationInfo.map(item => {
          const { since, from, ...serviceItemRest } = item;

          return {
            periodFrom: since,
            periodTo: from,
            ...serviceItemRest,
          };
        }),
        ...rest,
      };
    }),
  );

  return {
    prorationInfo: changedProration,
    ...prorationRest,
  };
};
