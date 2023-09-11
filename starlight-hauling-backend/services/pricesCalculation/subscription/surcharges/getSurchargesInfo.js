import generateStub from './surchargeStub.js';
import mapSurchargeToServiceItems from './mapSurchargeToServiceItems.js';

const getSurchargesInfo = async (
  ctx,
  {
    serviceItems,
    applySurcharges,
    businessUnitId,
    businessLineId,
    billingCycle,
    customRatesGroupId,
  },
  dependencies,
) => {
  const subscriptionSurcharges = [];
  let totalSurcharge = 0;
  const serviceItemTotals = [];

  if (applySurcharges) {
    await Promise.all(
      serviceItems.map(async serviceItem => {
        const surchargeStub = await generateStub(
          { ctx, serviceItem, businessUnitId, businessLineId, billingCycle, customRatesGroupId },
          dependencies,
        );

        subscriptionSurcharges.push(surchargeStub);
        const { totalSurchargePrice, ...surcharges } = mapSurchargeToServiceItems(
          serviceItem,
          surchargeStub,
        );

        if (totalSurchargePrice) {
          totalSurcharge += totalSurchargePrice;
          serviceItemTotals.push(surcharges);
        }
      }),
    );
  }

  return {
    subscriptionSurcharges,
    totalSurcharge,
    serviceItemTotals,
  };
};

export default getSurchargesInfo;
