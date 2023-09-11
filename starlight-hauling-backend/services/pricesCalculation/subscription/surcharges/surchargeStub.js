import getSurchargesInfo from '../../subscriptionOrder/surcharges/getSurchagesInfo.js';

const getRecurringLineItemInfo = async (
  { ctx, condition },
  { BillableLineItemRepo, RecurringLineItemsGlobalRatesRepo, RecurringLineItemsCustomRatesRepo },
) => {
  const { customRatesGroupId } = condition;
  const ratesRepo = customRatesGroupId
    ? RecurringLineItemsCustomRatesRepo.getInstance(ctx.state)
    : RecurringLineItemsGlobalRatesRepo.getInstance(ctx.state);

  if (!customRatesGroupId) {
    delete condition.customRatesGroupId;
  }

  const [lineItem] = await BillableLineItemRepo.getInstance(ctx.state).getByIds({
    ids: [condition.lineItemId],
  });
  const [rate] = await ratesRepo.getHistoricalRecords({ condition });

  return [lineItem, rate];
};

const getServiceItemInfo = async (
  { ctx, condition, billingCycle },
  {
    BillableServiceRepo,
    RecurringServicesGlobalRatesRepo,
    GlobalRatesRecurringServiceRepo,
    CustomRatesGroupServiceRepo,
  },
) => {
  const { billableServiceId, customRatesGroupId } = condition;
  if (!condition.customRatesGroupId) {
    delete condition.customRatesGroupId;
  }

  let rate;

  if (customRatesGroupId) {
    rate = await CustomRatesGroupServiceRepo.getInstance(ctx.state).getOne({ condition });
  } else {
    const globalRate = await GlobalRatesRecurringServiceRepo.getInstance(ctx.state).getOne({
      condition,
    });
    rate = await RecurringServicesGlobalRatesRepo.getInstance(ctx.state).getBy({
      condition: { globalRateRecurringServiceId: globalRate?.id, billingCycle },
    });
  }

  const [service] = await BillableServiceRepo.getInstance(ctx.state).getAll({
    condition: { id: billableServiceId },
  });

  return [service, rate];
};

const getSurchargeRate = async (
  { ctx, condition },
  { GlobalRatesSurchargeRepo, CustomRatesSurchargeRepo },
) => {
  const { customRatesGroupId } = condition;
  const repo = customRatesGroupId
    ? CustomRatesSurchargeRepo.getInstance(ctx.state)
    : GlobalRatesSurchargeRepo.getInstance(ctx.state);
  if (!customRatesGroupId) {
    delete condition.customRatesGroupId;
  }
  return await repo.getOne({ condition });
};

const generateStub = async (
  { ctx, serviceItem, businessUnitId, businessLineId, billingCycle, customRatesGroupId },
  {
    BillableServiceRepo,
    BillableSurchargeRepo,
    BillableLineItemRepo,
    GlobalRatesSurchargeRepo,
    CustomRatesSurchargeRepo,
    RecurringServicesGlobalRatesRepo,
    RecurringLineItemsGlobalRatesRepo,
    RecurringLineItemsCustomRatesRepo,
    GlobalRatesRecurringServiceRepo,
    CustomRatesGroupServiceRepo,
    SubsriptionSurchargeRepo,
  },
) => {
  let surcharges = [];

  // Service Item
  const { billableServiceId, materialId } = serviceItem;

  let serviceRateCondition = { billableServiceId, businessLineId, businessUnitId };
  if (materialId) {
    serviceRateCondition = { ...serviceRateCondition, materialId };
  }
  if (customRatesGroupId) {
    serviceRateCondition = { ...serviceRateCondition, customRatesGroupId };
  }
  const [billableService, serviceRate] = await getServiceItemInfo(
    {
      ctx,
      condition: serviceRateCondition,
      billingCycle,
    },
    {
      BillableServiceRepo,
      RecurringServicesGlobalRatesRepo,
      GlobalRatesRecurringServiceRepo,
      CustomRatesGroupServiceRepo,
    },
  );

  if (!billableService.applySurcharges) {
    return undefined;
  }

  const billableSurcharges = await BillableSurchargeRepo.getInstance(ctx.state).getAll({
    condition: { active: true, businessLineId },
  });

  await Promise.all(
    billableSurcharges.map(async ({ id: surchargeId, materialBasedPricing, calculation }) => {
      let surchargeRateCondition = { businessUnitId, businessLineId, surchargeId };
      if (materialBasedPricing) {
        surchargeRateCondition = { ...surchargeRateCondition, materialId: serviceItem.materialId };
      }

      // First of all we retrieve surcharge rate.
      const surchargeRate = await getSurchargeRate(
        {
          ctx,
          condition: { ...surchargeRateCondition, customRatesGroupId },
        },
        { GlobalRatesSurchargeRepo, CustomRatesSurchargeRepo },
      );
      if (!surchargeRate) {
        return undefined;
      }

      const baseSurcharge = {
        surchargeId,
        type: calculation,
        globalRatesSurchargesId: customRatesGroupId ? null : surchargeRate?.id,
        customRatesGroupSurchargesId: customRatesGroupId ? surchargeRate?.id : null,
      };

      if (calculation === 'flat' && serviceRate) {
        surcharges.push({
          ...baseSurcharge,
          amount: serviceItem.serviceItemProrationInfo.quantity * serviceRate.price,
          billableServiceId: serviceItem.billableServiceId,
        });
      } else if (calculation === 'percentage') {
        if (serviceRate) {
          surcharges.push({
            ...baseSurcharge,
            amount:
              serviceItem.serviceItemProrationInfo.quantity *
              serviceRate.price *
              (surchargeRate.price / 100),
            billableServiceId: serviceItem.billableServiceId,
          });
        }

        // Recurring Line Items
        // *Only percentage surcharges for RLI.
        await Promise.all(
          serviceItem.lineItemsProrationInfo.map(async lineItemInfo => {
            const [billableLineItem, lineItemRate] = await getRecurringLineItemInfo(
              {
                ctx,
                condition: {
                  businessUnitId,
                  businessLineId,
                  billingCycle,
                  customRatesGroupId,
                  lineItemId: lineItemInfo.billableLineItemId,
                },
              },
              {
                BillableLineItemRepo,
                RecurringLineItemsGlobalRatesRepo,
                RecurringLineItemsCustomRatesRepo,
              },
            );

            if (billableLineItem.applySurcharges) {
              surcharges.push({
                ...baseSurcharge,
                amount: lineItemInfo.quantity * lineItemRate.price * (surchargeRate.price / 100),
                billableLineItemId: lineItemInfo.billableLineItemId,
              });
            }
          }),
        );
      }
      return surcharges;
    }),
    // Subscription Orders
    await Promise.all(
      serviceItem.subscriptionOrders.map(async subscriptionOrderInfo => {
        const { orderSurcharges } = await getSurchargesInfo(
          ctx,
          {
            businessLineId,
            businessUnitId,
            customRatesGroupId,
            subscriptionOrder: { ...subscriptionOrderInfo, materialId: serviceItem.materialId },
            needRecalculateSurcharge: true,
          },
          { SubsriptionSurchargeRepo, BillableSurchargeRepo, BillableServiceRepo },
        );
        surcharges = surcharges.concat(orderSurcharges || []);
      }),
    ),
  );

  return surcharges;
};

export default generateStub;
