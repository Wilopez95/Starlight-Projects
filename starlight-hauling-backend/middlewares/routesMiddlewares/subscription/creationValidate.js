import ApiError from '../../../errors/ApiError.js';
import BillableServiceRepo from '../../../repos/billableService.js';
import BillableLineItemBillingCycleRepo from '../../../repos/billableLineItemBillingCycle.js';

import { ALLOWED_BILLING_CYCLE_FOR_ANNIVERSARY_BILLING } from '../../../consts/billingCycles.js';

const validateAnniversaryBilling = ({ billingCycle, anniversaryBilling }) => {
  if (!anniversaryBilling) {
    return;
  }

  const isAllowedAnniversaryBilling =
    ALLOWED_BILLING_CYCLE_FOR_ANNIVERSARY_BILLING.includes(billingCycle);

  if (!isAllowedAnniversaryBilling) {
    throw ApiError.invalidRequest(undefined, 'NOT_ALLOW_ANNIVERSARY_BILLING');
  }
};

const validateServiceItemBillingType = async (ctx, { data }) => {
  const billingServiceBillingCycleTable = BillableServiceRepo.getInstance(ctx.state);

  const { serviceItems, billingCycle } = data;
  const billableServiceIds = serviceItems.map(item => item.billableServiceId);

  const billableServices = await billingServiceBillingCycleTable.getBillingCyclesByIds({
    billableServiceIds,
  });

  const wrongBillableCycle =
    billableServices?.filter(item => !item.billingCycles.includes(billingCycle)) ?? [];

  if (wrongBillableCycle.length) {
    throw ApiError.invalidRequest(undefined, wrongBillableCycle);
  }
};

const validateBillableLineItem = async (ctx, { data }) => {
  const { serviceItems, billingCycle } = data;

  const lineItemIds = serviceItems.flatMap(
    serviceItem => serviceItem.lineItems?.map(lineItem => lineItem.billableLineItemId) ?? [],
  );
  if (!lineItemIds.length) {
    return;
  }

  const billingServiceBillingCycleTable = BillableLineItemBillingCycleRepo.getInstance(ctx.state);

  const billableLineItems = await billingServiceBillingCycleTable.getAllByIds({
    ids: lineItemIds,
  });

  if (!billableLineItems?.length) {
    return;
  }

  const wrongBillableLineItems = billableLineItems?.filter(
    item => !item.billingCycles.includes(billingCycle),
  );

  if (wrongBillableLineItems.length) {
    throw ApiError.invalidRequest(undefined, wrongBillableLineItems);
  }
};

const subscriptionCreateValidate = async (ctx, next) => {
  const { body } = ctx.request.validated;

  validateAnniversaryBilling(body);

  await validateBillableLineItem(ctx, { data: body });
  await validateServiceItemBillingType(ctx, { data: body });

  await next();
};

export default subscriptionCreateValidate;
