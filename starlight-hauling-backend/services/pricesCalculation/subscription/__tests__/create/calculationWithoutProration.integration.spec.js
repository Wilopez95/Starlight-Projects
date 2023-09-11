import cloneDeep from 'lodash/cloneDeep.js';
import repos from '../mocks/repos.js';
import ctx from '../mocks/ctx.js';
import calculatePrices from '../../calculatePrices.js';
import { BILLING_CYCLE } from '../../../../../consts/billingCycles.js';
import { PRORATION_TYPE } from '../../../../../consts/prorationTypes.js';

jest.mock('../../../../../utils/unitsConvertor.js');

describe('calculate subscription prices without proration on create', () => {
  const baseInput = {
    businessUnitId: 43,
    businessLineId: 30,
    billingCycle: BILLING_CYCLE.monthly,
    anniversaryBilling: false,
    startDate: new Date('2021-07-01T06:00:00.000Z'),
    endDate: null,
    // customRatesGroupId: 54,
    customRatesGroupId: null,
    serviceItems: [
      {
        serviceItemId: null,
        billableServiceId: 1729,
        // materialId: 29,
        materialId: null,
        serviceFrequencyId: 9,
        price: null,
        quantity: 4,
        prorationType: PRORATION_TYPE.usageDays,
        effectiveDate: null,
        serviceDaysOfWeek: {},
        lineItems: [
          {
            lineItemId: null,
            billableLineItemId: 47,
            price: null,
            effectiveDate: null,
            quantity: 2,
          },
        ],
        subscriptionOrders: [
          {
            subscriptionOrderId: null,
            billableServiceId: 1603,
            serviceDate: new Date('2021-07-14T06:00:00.000Z'),
            price: null,
            quantity: 1,
          },
        ],
      },
    ],
    jobSiteId: 3,
    today: new Date('2021-07-01T06:00:00.000Z'),
  };

  test('global prices not based on material', async () => {
    const input = cloneDeep(baseInput);
    input.customRatesGroupId = null;
    input.serviceItems[0].materialId = null;

    const result = await calculatePrices(ctx, input, repos);

    expect(result.subscriptionPrices).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationInfo).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationPeriods).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.subscriptionSurcharges).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.taxesInfo).toMatchSnapshot();
  });

  test('global prices based on material', async () => {
    const input = cloneDeep(baseInput);
    input.customRatesGroupId = null;
    input.serviceItems[0].materialId = 29;

    const result = await calculatePrices(ctx, input, repos);

    expect(result.subscriptionPrices).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationInfo).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationPeriods).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.subscriptionSurcharges).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.taxesInfo).toMatchSnapshot();
  });

  test('custom prices not based on material', async () => {
    const input = cloneDeep(baseInput);
    input.customRatesGroupId = 54;
    input.serviceItems[0].materialId = null;

    const result = await calculatePrices(ctx, input, repos);

    expect(result.subscriptionPrices).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationInfo).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationPeriods).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.subscriptionSurcharges).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.taxesInfo).toMatchSnapshot();
  });

  test('custom prices based on material', async () => {
    const input = cloneDeep(baseInput);
    input.customRatesGroupId = 54;
    input.serviceItems[0].materialId = 29;

    const result = await calculatePrices(ctx, input, repos);

    expect(result.subscriptionPrices).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationInfo).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationPeriods).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.subscriptionSurcharges).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.taxesInfo).toMatchSnapshot();
  });

  test('prices with surcharges', async () => {
    const input = cloneDeep(baseInput);
    input.applySurcharges = true;

    const result = await calculatePrices(ctx, input, repos);

    expect(result.subscriptionPrices).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationInfo).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.prorationPeriods).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.subscriptionSurcharges).toMatchSnapshot();
    expect(result.subscriptionPriceCalculation.taxesInfo).toMatchSnapshot();
  });
});
