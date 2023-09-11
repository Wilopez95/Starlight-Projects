import omit from 'lodash/fp/omit.js';
import pick from 'lodash/fp/pick.js';

import PurchaseOrderRepo from '../../repos/purchaseOrder.js';
import SubscriptionWorkOrdersRepo from '../../repos/subscriptionWorkOrder.js';
import SubscriptionOrdersRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import GlobalRatesServiceRepo from '../../repos/globalRatesService.js';
import CustomRatesGroupServiceRepo from '../../repos/customRatesGroupService.js';
import calculateSubscriptionOrderPrice from '../pricesCalculation/subscription/prices/subscriptionOrderPrice.js';
import { publishers } from '../ordersGeneration/publishers.js';

import { SUBSCRIPTION_WO_STATUS } from '../../consts/workOrder.js';
import { subscriptionOrderFieldsForWos } from '../../consts/subscriptionOrders.js';
import { updateSubscriptionOrdersSummary } from './updateSubscriptionOrdersSummary.js';
import { getCalcParams } from './utils/getCalcParams.js';
import { canRegenerate } from './utils/canRegenerate.js';
import { changesAreCritical } from './utils/changesAreCritical.js';

export const updateBasedOnSnapshot = async (
  ctx,
  {
    subscription,
    id,
    availableCredit,
    unlockOverrides,
    customRatesGroupId,
    deletedWorkOrders = [],
    updatedWorkOrders = [],
    ...updates
  },
  trx,
) => {
  ctx.logger.debug(`subsOrderService->updateBasedOnSnapshot->id: ${id}`);
  ctx.logger.debug(subscription, 'subsOrderService->updateBasedOnSnapshot->subscription');
  ctx.logger.debug(updates, 'subsOrderService->updateBasedOnSnapshot->updates');

  const subsOrdersRepo = SubscriptionOrdersRepo.getInstance(ctx.state);

  const subsriptionOrder = await subsOrdersRepo.getItemBySpecificDate({
    subscriptionOrderId: id,
    withOriginalIds: true,
  });
  ctx.logger.debug(subsriptionOrder, 'subsOrderService->updateBasedOnSnapshot->subsriptionOrder');

  const updatedSubscriptionOrder = {
    ...omit([
      'id',
      'createdAt',
      'updatedAt',
      'billableServiceOriginalId',
      'materialOriginalId',
      'customRatesGroupOriginalId',
      'jobSiteContactOriginalId',
      'subscriptionContactOriginalId',
      'globalRatesServicesOriginalId',
      'permitOriginalId',
      'promoOriginalId',
    ])(subsriptionOrder),
    billableServiceId: subsriptionOrder.billableServiceOriginalId,
    materialId: subsriptionOrder.materialOriginalId,
    jobSiteContactId: subsriptionOrder.jobSiteContactOriginalId,
    subscriptionContactId: subsriptionOrder.subscriptionContactOriginalId,
    permitId: subsriptionOrder.permitOriginalId,
    promoId: subsriptionOrder.promoOriginalId,
    customRatesGroupId,
    ...omit(['oneTimePurchaseOrderNumber', 'customerId'])(updates),
    unlockOverrides,
  };

  if (!unlockOverrides) {
    const calcParams = getCalcParams({
      subsriptionOrder,
      updatedSubscriptionOrder,
      subscription,
      updates,
      customRatesGroupId,
      id,
    });

    ctx.logger.debug(calcParams, 'subsOrderService->updateBasedOnSnapshot->calcParams');
    const rate = await calculateSubscriptionOrderPrice(ctx, calcParams, {
      CustomRatesGroupServiceRepo,
      SubscriptionOrdersRepo,
      GlobalRatesServiceRepo,
    });
    ctx.logger.debug(rate, 'subsOrderService->updateBasedOnSnapshot->rate');
    updatedSubscriptionOrder.price = rate.price;
  }

  if (updates.oneTimePurchaseOrderNumber && updates.customerId) {
    const { id: purchaseOrderId } = await PurchaseOrderRepo.getInstance(ctx.state).softUpsert(
      {
        data: {
          customerId: updates.customerId,
          poNumber: updates.oneTimePurchaseOrderNumber,
          isOneTime: true,
          active: true,
        },
      },
      trx,
    );
    updatedSubscriptionOrder.purchaseOrderId = purchaseOrderId;
  }

  ctx.logger.debug(
    updatedSubscriptionOrder,
    'subsOrderService->updateBasedOnSnapshot->updatedSubscriptionOrder',
  );
  const subscriptionOrder = await subsOrdersRepo.updateOne(
    {
      condition: { id },
      fields: ['*'],
      data: updatedSubscriptionOrder,
      availableCredit,
      log: false,
    },
    trx,
  );
  subscriptionOrder.id = id;
  const subsWosRepo = SubscriptionWorkOrdersRepo.getInstance(ctx.state);
  if (updates.deletedAt) {
    const deletedAtWorkOrders = await subsWosRepo.softDeleteBySubscriptionsOrdersIds(
      {
        condition: { subscriptionsOrdersIds: [id] },
        statuses: [SUBSCRIPTION_WO_STATUS.scheduled],
      },
      trx,
    );

    deletedWorkOrders.push(...deletedAtWorkOrders);
    return null;
  }
  const regenerate = canRegenerate(subscriptionOrder);
  const criticalChanges = changesAreCritical(subsriptionOrder, updatedSubscriptionOrder);

  ctx.logger.debug(`subsOrderService->updateBasedOnSnapshot->regenerate: ${regenerate}`);
  ctx.logger.debug(`subsOrderService->updateBasedOnSnapshot->criticalChanges: ${criticalChanges}`);
  if (criticalChanges && regenerate) {
    // re-generate WOs

    const [deletedWo, updatedWo] = await Promise.all([
      subsWosRepo.softDeleteBySubscriptionsOrdersIds(
        {
          condition: { subscriptionsOrdersIds: [id] },
          statuses: [SUBSCRIPTION_WO_STATUS.scheduled],
        },
        trx,
      ),
      subsWosRepo.updateByStatuses(
        {
          condition: { subscriptionOrderId: id },
          statuses: [SUBSCRIPTION_WO_STATUS.inProgress],
          data: { status: SUBSCRIPTION_WO_STATUS.canceled },
        },
        trx,
      ),
    ]);
    deletedWorkOrders.push(...deletedWo);
    updatedWorkOrders.push(...updatedWo);

    const template = {
      ...omit(['id'])(pick(subscriptionOrderFieldsForWos)(subscriptionOrder)),
      subscriptionId: subscriptionOrder.subscriptionId,
      subscriptionOrderId: id,
      status: SUBSCRIPTION_WO_STATUS.scheduled,
    };
    ctx.logger.debug(template, 'subsOrderService->updateBasedOnSnapshot->template');
    await publishers.generateSubscriptionWorkOrders(ctx, {
      templates: [template],
    });
  } else {
    // TODO: propagate changes to Subs Orders
    await updateSubscriptionOrdersSummary(
      ctx,
      {
        syncToRoutePlanner: true,
        subscriptionOrders: [subscriptionOrder],
      },
      trx,
    );
  }
  return subscriptionOrder;
};
