import { Next } from 'koa';
import { DataSource, In, IsNull, Not, UpdateResult } from 'typeorm';
import { isEmpty } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseController } from '../base.controller';
import { SubscriptionWorkOrders } from '../../database/entities/tenant/SubscriptionWorkOrders';
import { SubscriptionWorkOrdersHistorical } from '../../database/entities/tenant/SubscriptionWorkOrdersHistorical';
import { SubscriptionWorkOrdersMedia } from '../../database/entities/tenant/SubscriptionWorkOrdersMedia';
import { SubscriptionWorkOrdersLineItems } from '../../database/entities/tenant/SubscriptionWorkOrdersLineItems';
import { SubscriptionOrders } from '../../database/entities/tenant/SubscriptionOrders';
import httpStatus from '../../consts/httpStatusCodes';
import { SUBSCRIPTION_WO_STATUS } from '../../consts/workOrder';
import { validateStatusDate } from '../../utils/validateStatusDate';
import { Context } from '../../Interfaces/Auth';
import { IGetSubscriptionByStatus } from '../../Interfaces/SubscriptionworkOrder';

export class SubscriptionWorkOrderController extends BaseController {
  async getSubscriptionWorkOrders(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionWorkOrders);
  }

  async getSubscriptionWorkOrdersBy(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const workOrders = await dataSource.manager.find(SubscriptionWorkOrders, {
      where: ctx.request.body,
    });
    const lineItems = await dataSource.manager.find(SubscriptionWorkOrdersLineItems, {
      where: {
        subscriptionWorkOrderId: In(workOrders.map(wo => wo.id)),
      },
    });
    const extendedWorkOrders = workOrders.map(swo => {
      return {
        ...swo,
        lineItems: lineItems.filter(li => li.subscriptionWorkOrderId == swo.id),
      };
    });

    ctx.body = extendedWorkOrders;
    ctx.status = 200;
    await dataSource.destroy();
    return next();
  }

  async addSubscriptionWorkOrders(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionWorkOrders, SubscriptionWorkOrdersHistorical);
  }

  async bulkaddSubscriptionWorkOrders(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInserts(ctx, next, SubscriptionWorkOrders, SubscriptionWorkOrdersHistorical);
  }

  async getSequenceCount(ctx: Context, next: Next) {
    const subscriptionId = ctx.request.body.id;

    let response: number[] = [];
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const countRecurrentOrders = await dataSource
      .createQueryBuilder()
      .select('subscriptionOrders')
      .withDeleted()
      .from(SubscriptionWorkOrders, 'subscriptionOrders')
      .where(`subscriptionOrders.subscriptionOrderId = ${subscriptionId}`)
      .getCount();

    const sequenceId = await dataSource
      .createQueryBuilder()
      .select('subscriptionOrders.sequenceId')
      .from(SubscriptionOrders, 'subscriptionOrders')
      .where(`subscriptionOrders.id = ${subscriptionId}`)
      .getOne();

    await dataSource.destroy();

    response = [countRecurrentOrders, Number(sequenceId?.sequenceId)];

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async updateStatusBySubscriptionsOrdersIds(ctx: Context, next: Next) {
    const { subscriptionsOrdersIds, statuses, status } = ctx.request.body;
    let items: UpdateResult | undefined;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const workOrders = await dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders.id')
      .addSelect('subscriptionsOrders.status')
      .from(SubscriptionWorkOrders, 'subscriptionsOrders')
      .where({ subscriptionOrderId: In(subscriptionsOrdersIds as number[]) })
      .andWhere({ status: In(statuses as string[]) })
      .getMany();

    if (workOrders.length) {
      const subscriptionWoIds = workOrders.map(item => item.id);

      items = await dataSource
        .createQueryBuilder()
        .update(SubscriptionWorkOrders)
        .set({ status })
        .where({ id: In(subscriptionWoIds) })
        .execute();

      for (let index = 0; index < subscriptionWoIds.length; index++) {
        const data = await dataSource.manager.findOneBy(SubscriptionWorkOrders, {
          id: subscriptionWoIds[index],
        });
        const historical: QueryDeepPartialEntity<SubscriptionWorkOrders> = {
          ...data,
          ...BaseController.historicalAttributes('edited', subscriptionWoIds[index], ctx),
        };
        await dataSource.manager.insert(SubscriptionWorkOrdersHistorical, historical);
      }
    }

    await dataSource.destroy();

    ctx.body = items ? items : [];
    ctx.status = 200;
    return next();
  }

  async softDeleteBy(ctx: Context) {
    const { subscriptionIds, statuses } = ctx.request.body;
    const dataSourceSoft: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    let qb = dataSourceSoft
      .createQueryBuilder()
      .select('subscriptionsOrders.id')
      .from(SubscriptionWorkOrders, 'subscriptionsOrders')
      .where({
        subscriptionOrderId: In(subscriptionIds as number[]),
      });

    if (statuses?.length) {
      qb = qb.andWhere({ status: In(statuses as string[]) });
    }
    const response: SubscriptionWorkOrders[] = await qb.getMany();
    await dataSourceSoft.destroy();

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    if (!isEmpty(response)) {
      for (let index = 0; index < response.length; index++) {
        await dataSource
          .createQueryBuilder()
          .softDelete()
          .from(SubscriptionWorkOrders, 'subscriptionsWorkOrders')
          .where({ id: response[index].id })
          .execute();
      }
    }
    await dataSource.destroy();
    ctx.body = response;

    ctx.status = 200;
  }

  async count(ctx: Context, next: Next) {
    const { subscriptionIds, hasComment, hasRoutes } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    let qb = dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders.subscriptionOrderId')
      .from(SubscriptionWorkOrders, 'subscriptionsOrders')
      .where('subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)', {
        subscriptionIds,
      })
      .andWhere({ deletedAt: IsNull() })
      .groupBy('subscriptionsOrders.subscriptionOrderId');

    if (hasComment) {
      qb = qb
        .andWhere({ commentFromDriver: Not(IsNull()) })
        .andWhere({ commentFromDriver: Not('') });
    }

    if (hasRoutes) {
      qb = qb.andWhere({ assignedRoute: Not(IsNull()) }).andWhere({ assignedRoute: Not('') });
    }

    const response = await qb.getCount();

    await dataSource.destroy();

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async countStatus(ctx: Context, next: Next) {
    const { subscriptionIds, status } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    const response = await dataSource
      .createQueryBuilder()
      .select(`COUNT(subscriptionsOrders.id) AS ${status}`)
      .from(SubscriptionWorkOrders, 'subscriptionsOrders')
      .where('subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)', {
        subscriptionIds,
      })
      .andWhere({ deletedAt: IsNull() })
      .andWhere({ status })
      .groupBy('subscriptionsOrders.subscriptionOrderId')
      .getCount();

    await dataSource.destroy();

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async countJoin(ctx: Context, next: Next) {
    const { subscriptionIds, subscriptionMedia, subscriptionLine } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    let qb = dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders.subscriptionOrderId')
      .from(SubscriptionWorkOrders, 'subscriptionsOrders')
      .where('subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)', {
        subscriptionIds,
      })
      .andWhere({ deletedAt: IsNull() })
      .groupBy('subscriptionsOrders.subscriptionOrderId');

    if (subscriptionMedia) {
      qb = qb
        .addSelect('distinct(subscriptionWoMediaT.id)')
        .leftJoin(
          SubscriptionWorkOrdersMedia,
          'subscriptionWoMediaT',
          'subscriptionWoMediaT.subscriptionWorkOrderId = subscriptionsOrders.id',
        )
        .andWhere('subscriptionWoMediaT.id IS NOT NULL');
    }

    if (subscriptionLine) {
      qb = qb
        .addSelect('distinct(subscriptionWoLineItemT.id)')
        .leftJoin(
          SubscriptionWorkOrdersLineItems,
          'subscriptionWoLineItemT',
          'subscriptionWoLineItemT.subscriptionWorkOrderId = subscriptionsOrders.id',
        )
        .andWhere('subscriptionWoLineItemT.id IS NOT NULL');
    }

    const response = await qb.getCount();

    await dataSource.destroy();

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async getSubscriptionByStatus(ctx: Context, next: Next) {
    const { subscriptionIds, columnName, orderBy, condition, statuses } = ctx.request
      .body as IGetSubscriptionByStatus;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    let qb = dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionWorkOrders, 'subscriptionsOrders')
      .where('subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)', {
        subscriptionIds,
      })
      .andWhere({ deletedAt: IsNull() })
      .groupBy('subscriptionsOrders.id')
      .orderBy(columnName, orderBy)
      .limit(1);

    if (condition === '=') {
      qb = qb.andWhere({ status: statuses });
    }

    if (condition === 'in') {
      qb = qb.andWhere({ status: In(statuses) });
    }

    if (condition === 'not in') {
      qb = qb.andWhere({ status: Not(In(statuses)) });
    }
    const response = await qb.getRawOne();

    await dataSource.destroy();
    ctx.body = response || 0;
    ctx.status = 200;
    return next();
  }

  async deleteSubscriptionWorkOrders(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionWorkOrders);
  }

  async updateStatus(ctx: Context, next: Next) {
    const { subscriptionOrderId } = ctx.request.body;
    if (!subscriptionOrderId) {
      ctx.status = httpStatus.BAD_REQUEST;
      return next();
    }
    const filters = {
      status: In([SUBSCRIPTION_WO_STATUS.scheduled, SUBSCRIPTION_WO_STATUS.inProgress]),
      subscriptionOrderId,
    };
    ctx.request.body.where = filters;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const items = await dataSource
      .createQueryBuilder()
      .update(SubscriptionWorkOrders)
      .set({ status: ctx.request.body.status })
      .where(filters)
      .select('*')
      .execute();

    for await (const item of items) {
      const historical: QueryDeepPartialEntity<SubscriptionWorkOrdersHistorical> = {
        ...item,
        ...BaseController.historicalAttributes('edited', item.id as number, ctx),
      };
      await dataSource.manager.insert(SubscriptionWorkOrdersHistorical, historical);
    }

    await dataSource.destroy();

    ctx.body = items;
    ctx.status = httpStatus.OK;
    return next();
  }

  async updateSubscriptionWorkOrder(ctx: Context, next: Next) {
    ctx.request.body = validateStatusDate(
      ctx.request.body.status as string,
      ctx.request.body as SubscriptionOrders,
    );

    const subscriptionOrderId = ctx.request.body.subscriptionOrderId;
    await super.update(ctx, next, SubscriptionWorkOrders, SubscriptionWorkOrdersHistorical);
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    const subscriptionWorkOrders = await dataSource
      .createQueryBuilder()
      .where(`subscriptionWorkOrders.subscriptionOrderId = ${subscriptionOrderId}`)
      .select('SUM(subscriptionWorkOrders.weight)')
      .from(SubscriptionWorkOrders, 'subscriptionWorkOrders')
      .execute();

    const sum = subscriptionWorkOrders[0].sum as string;

    await dataSource
      .createQueryBuilder()
      .update(SubscriptionOrders)
      .set({ weight: parseFloat(sum) })
      .where({ id: subscriptionOrderId })
      .execute();

    await dataSource.destroy();
  }

  async updateManySubscriptionWorkOrder(ctx: Context, next: Next) {
    const { data } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    const items = await dataSource
      .createQueryBuilder()
      .update(SubscriptionWorkOrders)
      .set(data as SubscriptionWorkOrders)
      .execute();

    items.generatedMaps.forEach(async item => {
      const newData = await dataSource.manager.findOneBy(SubscriptionWorkOrders, {
        id: item.id,
      });
      const historical: QueryDeepPartialEntity<SubscriptionWorkOrders> = {
        ...newData,
        ...BaseController.historicalAttributes('edited', item.id as number, ctx),
      };
      await dataSource.manager.insert(SubscriptionWorkOrdersHistorical, historical);
    });

    await dataSource.destroy();

    ctx.body = items;
    ctx.status = 200;
    return next();
  }
}
