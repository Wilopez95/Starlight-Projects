import OrderHistory from '../../entities/OrderHistory';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';
import { QueryContext } from '../../../../types/QueryContext';
import Order from '../../entities/Order';
import AuditEntityAction from '../../../../entities/AuditEntityAction';
import BaseHistoryEntity from '../../../../entities/BaseHistoryEntity';
import BaseEntityWithHistory from '../../../../entities/BaseEntityWithHistory';

type ExtendOrderHistory = {
  order: Order;
  ctx: QueryContext;
  action: AuditEntityAction;
};

export const extendOrderHistory: ({ order, ctx, action }: ExtendOrderHistory) => void = async ({
  order,
  ctx,
  action,
}) => {
  try {
    if (!order) {
      return;
    }

    const ContextualizedOrderHistory = getContextualizedEntity(OrderHistory)(ctx);

    const historyRecord = {
      ...order,
      uuid: ctx.reqId,
      reason: order.reason,
      performedBy: `${ctx.userInfo.firstName} ${ctx.userInfo.lastName}`,
      action,
    };

    const orderHistory = new BaseHistoryEntity((historyRecord as unknown) as BaseEntityWithHistory);

    await ContextualizedOrderHistory.insert(orderHistory);
  } catch (e) {
    throw new Error('Error while executing Order History job');
  }
};
