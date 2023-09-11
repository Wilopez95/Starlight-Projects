import calculatePrices from '../calculatePrices.js';
import ctx from './mocks/ctx.js';
import pricesRepo from './mocks/priceRepo.js';
import baseRepo from './mocks/baseRepo.js';
import priceGroupsRepo from './mocks/priceGroupRepo.js';
import surchargeRepo from './mocks/surchargeRepo.js';
import taxDistrictCustomerJobSiteRepo from './mocks/taxDistrictCustomerJobSiteRepo.js';
import tenantRepo from './mocks/tenantRepo.js';
import customerTaxExemptionsRepo from './mocks/customerTaxExemptionsRepo.js';
import orderRepo from './mocks/orderRepo.js';

jest.mock('../../../../utils/unitsConvertor.js');

describe('calculatePrices', () => {
  test('should return prices for billable services and line items if exist', async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      jobSiteId: 1,
      applySurcharges: false,
      applyTaxes: false,
      orders: [
        {
          priceGroupId: 1,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 1,
          equipmentItemId: 1,
          materialId: 1,
          price: null,
          quantity: 1,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 1,
              materialBasedPricing: true,
            },
          ],
        },
        {
          priceGroupId: 2,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 2,
          equipmentItemId: 2,
          materialId: 2,
          price: null,
          quantity: 2,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 2,
              materialBasedPricing: true,
            },
          ],
          // thresholds: [
          //     {
          //         thresholdItemId: null,
          //         thresholdId: 1,
          //         materialId: 1,
          //         price: null,
          //         quantity: 1,
          //     },
          // ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
    });
    expect(result).toMatchSnapshot();
  });

  test('should return null for billable services and line items if do not exist', async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      jobSiteId: 1,
      applySurcharges: false,
      applyTaxes: false,
      orders: [
        {
          priceGroupId: 1111,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 1111,
          equipmentItemId: 1,
          materialId: 1,
          price: null,
          quantity: 1,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1111,
              materialId: 1,
              price: null,
              quantity: 1,
            },
            {
              lineItemId: null,
              billableLineItemId: 2222,
              materialId: 2,
              price: null,
              quantity: 1,
            },
          ],
        },
        {
          priceGroupId: 1111,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 2222,
          equipmentItemId: 2,
          materialId: 2,
          price: null,
          quantity: 2,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1111,
              materialId: 1,
              price: null,
              quantity: 1,
            },
            {
              lineItemId: null,
              billableLineItemId: 2222,
              materialId: 2,
              price: null,
              quantity: 2,
            },
          ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
    });
    expect(result).toMatchSnapshot();
  });

  test('should return saved prices for existing order', async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      customerId: 154,
      jobSiteId: 46,
      customerJobSiteId: 2961,
      applySurcharges: true,
      applyTaxes: false,
      orders: [
        {
          priceGroupId: 1,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: 18921,
          billableServiceId: 1882,
          equipmentItemId: 1,
          materialId: 1819,
          price: null,
          quantity: 1,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1289,
              materialId: 1819,
              price: null,
              quantity: 1,
            },
            {
              lineItemId: null,
              billableLineItemId: 1157,
              materialId: 1819,
              price: null,
              quantity: 1,
            },
          ],
          thresholds: [
            {
              thresholdItemId: null,
              thresholdId: 371,
              materialId: 1819,
              price: null,
              quantity: 59,
            },
          ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
      taxDistrictCustomerJobSiteRepo,
      tenantRepo,
      customerTaxExemptionsRepo,
      orderRepo,
    });
    expect(result).toMatchSnapshot();
  });

  test('should apply flat and percentage surcharges', async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      jobSiteId: 1,
      applySurcharges: true,
      applyTaxes: false,
      orders: [
        {
          priceGroupId: 1,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 1,
          equipmentItemId: 1,
          materialId: 1,
          price: null,
          quantity: 1,
          applySurcharges: true,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              applySurcharges: true,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 1,
              applySurcharges: true,
              materialBasedPricing: true,
            },
          ],
        },
        {
          priceGroupId: 2,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 2,
          equipmentItemId: 2,
          materialId: 2,
          price: null,
          quantity: 2,
          applySurcharges: true,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              applySurcharges: true,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 2,
              applySurcharges: true,
              materialBasedPricing: true,
            },
          ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
    });
    expect(result).toMatchSnapshot();
  });

  test("should apply flat surcharges even if it's disabled by billable item config", async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      jobSiteId: 1,
      applySurcharges: true,
      applyTaxes: false,
      orders: [
        {
          priceGroupId: 1,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 1,
          equipmentItemId: 1,
          materialId: 1,
          price: null,
          quantity: 1,
          applySurcharges: false,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              applySurcharges: false,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 1,
              applySurcharges: false,
              materialBasedPricing: true,
            },
          ],
        },
        {
          priceGroupId: 2,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 2,
          equipmentItemId: 2,
          materialId: 2,
          price: null,
          quantity: 2,
          applySurcharges: false,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              applySurcharges: false,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 2,
              applySurcharges: false,
              materialBasedPricing: true,
            },
          ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
    });
    expect(result).toMatchSnapshot();
  });

  test('should apply taxes', async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      customerId: 154,
      jobSiteId: 46,
      customerJobSiteId: 2961,
      applySurcharges: true,
      applyTaxes: true,
      orders: [
        {
          priceGroupId: 1,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 1,
          equipmentItemId: 1,
          materialId: 1,
          price: null,
          quantity: 1,
          applySurcharges: true,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              applySurcharges: true,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 1,
              applySurcharges: true,
              materialBasedPricing: true,
            },
          ],
        },
        {
          priceGroupId: 2,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: null,
          billableServiceId: 2,
          equipmentItemId: 2,
          materialId: 2,
          price: null,
          quantity: 2,
          applySurcharges: true,
          materialBasedPricing: true,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1,
              materialId: 1,
              price: null,
              quantity: 1,
              applySurcharges: true,
              materialBasedPricing: true,
            },
            {
              lineItemId: null,
              billableLineItemId: 2,
              materialId: 2,
              price: null,
              quantity: 2,
              applySurcharges: true,
              materialBasedPricing: true,
            },
          ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
      taxDistrictCustomerJobSiteRepo,
      tenantRepo,
      customerTaxExemptionsRepo,
    });
    expect(result).toMatchSnapshot();
  });

  test('should apply taxes linked to existing order', async () => {
    const input = {
      businessUnitId: 1,
      businessLineId: 1,
      customerId: 154,
      jobSiteId: 46,
      customerJobSiteId: 2961,
      applySurcharges: true,
      applyTaxes: true,
      orders: [
        {
          priceGroupId: 1,
          serviceDate: new Date('2021-08-26T10:47:21.695Z'),
          orderId: 18921,
          billableServiceId: 1882,
          equipmentItemId: 1,
          materialId: 1819,
          price: null,
          quantity: 1,
          lineItems: [
            {
              lineItemId: null,
              billableLineItemId: 1289,
              materialId: 1819,
              price: null,
              quantity: 1,
            },
            {
              lineItemId: null,
              billableLineItemId: 1157,
              materialId: 1819,
              price: null,
              quantity: 1,
            },
          ],
          thresholds: [
            {
              thresholdItemId: null,
              thresholdId: 371,
              materialId: 1819,
              price: null,
              quantity: 59,
            },
          ],
        },
      ],
    };
    const result = await calculatePrices(ctx, input, {
      baseRepo,
      priceGroupsRepo,
      pricesRepo,
      surchargeRepo,
      taxDistrictCustomerJobSiteRepo,
      tenantRepo,
      customerTaxExemptionsRepo,
      orderRepo,
    });
    expect(result).toMatchSnapshot();
  });
});
