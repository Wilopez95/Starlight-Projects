import { Next } from 'koa';
import { DataSource, IsNull, Not } from 'typeorm';
import { isEmpty } from 'lodash';
import { SubscriptionServiceItemHistorical } from '../../database/entities/tenant/SubscriptionServiceItemHistorical';
import { SubscriptionServiceItem } from '../../database/entities/tenant/SubscriptionServiceItem';
import { BaseController } from '../base.controller';
import { Context } from '../../Interfaces/Auth';
import {
  GetDetailsForRoutePlanner,
  IDetailsForRoutePlannerResponse,
} from '../../Interfaces/SubscriptionServiceItem';
import httpStatus from '../../consts/httpStatusCodes';
import { IGeneralData, IRequesParamsGeneral } from '../../Interfaces/GeneralData';
import { getOrderData } from './../../request/haulingRequest';

export class SubscriptionServiceItemsController extends BaseController {
  async getSubscriptionServiceItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionServiceItem);
  }

  async getSubscriptionServiceItemBy(ctx: Context, next: Next) {
    ctx.request.body = { where: ctx.request.body };
    return super.getBy(ctx, next, SubscriptionServiceItem);
  }

  async getSubscriptionServiceItemById(ctx: Context) {
    const id = ctx.request.body.id;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    const response: SubscriptionServiceItem[] = [];
    try {
      const recurrentOrder = await dataSource.manager
        .createQueryBuilder()
        .select('subsServiceItem')
        .from(SubscriptionServiceItem, 'subsServiceItem')
        .leftJoinAndMapMany(
          'subsServiceItem.lineItems', // Row to map the information
          'SubscriptionLineItem', // Entity or table
          'lineItems', // Alias
          'subsServiceItem.id = lineItems.subscriptionServiceItemId', //Condition
        )
        .leftJoinAndMapMany(
          'subsServiceItem.subscriptionOrders', // Row to map the information
          'SubscriptionOrders', // Entity or table
          'subsOrders', // Alias
          'subsServiceItem.id = subsOrders.subscriptionServiceItemId', //Condition
        )
        .where(`subsServiceItem.id = ${id}`)
        .andWhere({ billingCycle: Not(IsNull()) })
        .getMany();

      if (!isEmpty(recurrentOrder)) {
        for (let index = 0; index < recurrentOrder.length; index++) {
          const ids: number[] = [];

          const requestbody: IRequesParamsGeneral = {
            billableServiceId: recurrentOrder[index].billableServiceId,
          };
          if (recurrentOrder[index].materialId) {
            requestbody.materialId = recurrentOrder[index].materialId;
          }
          if (recurrentOrder[index].serviceFrequencyId) {
            ids.push(recurrentOrder[index].serviceFrequencyId);
            requestbody.frequencyIds = ids;
          }
          try {
            const requestResponse = await getOrderData(ctx, {
              data: requestbody,
            });
            Object.assign(recurrentOrder[index], { ...requestResponse });
          } catch (error: unknown) {
            ctx.logger.error(error);
          }
          response.push(recurrentOrder[index]);
        }
      }
    } catch (error: unknown) {
      ctx.logger.error(error);
    }
    await dataSource.destroy();
    ctx.body = response;
    ctx.status = 200;
    return response;
  }

  async getDetailsForRoutePlanner(ctx: Context, next: Next) {
    const id = ctx.request.body.id;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscription = (await dataSource
      .createQueryBuilder()
      .select('subsServiceItem')
      .from(SubscriptionServiceItem, 'subsServiceItem')
      .leftJoinAndMapOne(
        'subsServiceItem.subscription', // Row to map the information
        'Subscriptions', // Entity or table
        'subs', // Alias
        'subsServiceItem.subscriptionId = subs.id', //Condition
      )
      .where(`subsServiceItem.id = ${id}`)
      .getOne()) as GetDetailsForRoutePlanner | null;
    await dataSource.destroy();

    if (!subscription?.subscription) {
      ctx.status = httpStatus.BAD_REQUEST;
      return next();
    }
    const response: IDetailsForRoutePlannerResponse = {
      businessUnitId: subscription.subscription.businessUnitId,
      businessLineId: subscription.subscription.businessLineId,
      jobSiteNote: subscription.subscription.jobSiteNote,
      subscriptionId: subscription.subscription.id,
      serviceItemId: subscription.id,
    };
    const requestbody = {
      billableServiceId: subscription.billableServiceId,
      jobSiteContactId: subscription.subscription.jobSiteContactId,
      materialId: subscription.materialId,
      customerId_Histo: subscription.subscription.customerId,
      jobSiteId: subscription.subscription.jobSiteId,
      serviceAreaId: subscription.subscription.serviceAreaId,
    };
    const requestResponse = await getOrderData(ctx, { data: requestbody });

    const billableService = requestResponse.billableService;
    const jobSiteContact = requestResponse.jobSiteContact;
    const material = requestResponse.material;
    const customer = requestResponse.customer;
    const jobSite = requestResponse.jobSite;
    const serviceArea = requestResponse.serviceArea;

    const requestbodyEquipment = {
      equipmentItemId: billableService?.equipmentItemId,
    };
    const requestResponseEquipment: IGeneralData = await getOrderData(ctx, {
      data: requestbodyEquipment,
    });

    const equipmentItem = requestResponseEquipment.equipmentItem;

    response.customerId = customer?.originalId;
    response.jobSiteId = jobSite?.originalId;
    response.serviceAreaId = serviceArea?.originalId;
    response.materialId = material?.originalId;
    response.jobSiteContactId = jobSiteContact?.originalId;
    response.billableServiceId = billableService?.originalId;
    response.billableServiceDescription = billableService?.description;
    response.equipmentItemId = equipmentItem?.originalId;
    response.equipmentItemSize = equipmentItem?.size;

    ctx.body = response;
    ctx.status = httpStatus.OK;
    return next();
  }

  async addSubscriptionServiceItem(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionServiceItem, SubscriptionServiceItemHistorical);
  }

  async bulkaddSubscriptionServiceItem(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInserts(ctx, next, SubscriptionServiceItem, SubscriptionServiceItemHistorical);
  }

  async updateSubscriptionServiceItem(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    delete ctx.request.body.lineItems;
    return super.update(ctx, next, SubscriptionServiceItem, SubscriptionServiceItemHistorical, id);
  }

  async deleteSubscriptionServiceItem(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionServiceItem, SubscriptionServiceItemHistorical);
  }

  async getSubscriptionServiceItemIds(ctx: Context, next: Next) {
    const subscriptionId = ctx.request.body.subscriptionId;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource
      .createQueryBuilder()
      .select(['subscriptionServiceItem.id'])
      .from(SubscriptionServiceItem, 'subscriptionServiceItem')
      .where({ subscriptionId })
      .getMany();
    await dataSource.destroy();
    ctx.body = data[0];
    ctx.status = 200;
    return next();
  }

  async upsertSubscriptionServiceItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    await dataSource.manager.update(
      SubscriptionServiceItem,
      { subscriptionId: ctx.request.body[0].subscriptionId },
      { isDeleted: true },
    );
    await dataSource.destroy();
    return super.insert(ctx, next, SubscriptionServiceItem);
  }

  async getItemBySpecificDate(ctx: Context, next: Next) {
    const { serviceItemId, specifiedDate } = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscription = await dataSource
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp as effective_date',
      )
      .from(SubscriptionServiceItemHistorical, 'subsServiceItem')
      .where({ originalId: serviceItemId })
      .andWhere(
        `coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp <= '${specifiedDate}'`,
      )
      .orderBy(
        'coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp',
        'DESC',
      )
      .getRawOne();
    await dataSource.destroy();
    ctx.body = subscription;
    ctx.status = 200;
    return next();
  }

  async getNextItemBySpecificDate(ctx: Context, next: Next) {
    const { serviceItemId, specifiedDate } = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscription = await dataSource
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp as effective_date',
      )
      .from(SubscriptionServiceItemHistorical, 'subsServiceItem')
      .where({ originalId: serviceItemId })
      .andWhere(
        `coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp > '${specifiedDate}'`,
      )
      .orderBy(
        'coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp',
        'ASC',
      )
      .getRawOne();
    await dataSource.destroy();
    const result = subscription ? subscription : {};
    ctx.body = result;
    ctx.status = 200;
    return next();
  }
}
