import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import { Next } from 'koa';
import { DataSource, In, IsNull } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Subscriptions } from '../../database/entities/tenant/Subscriptions';
import { SubscriptionOrders } from '../../database/entities/tenant/SubscriptionOrders';
import { BaseController } from '../base.controller';
import { getBillableServiceBySubscription, getOrderData } from '../../request/haulingRequest';
import { SubscriptionServiceItem } from '../../database/entities/tenant/SubscriptionServiceItem';
import { SubscriptionLineItem } from '../../database/entities/tenant/SubscriptionLineItem';
import { unambiguousTupleCondition } from '../../utils/subscriptionOrderConditions';
import { SubscriptionOrdersHistorical } from '../../database/entities/tenant/SubscriptionOrdersHistorical';
import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses';
import { validateStatusDate } from '../../utils/validateStatusDate';
import { SubscriptionOrdersLineItems } from '../../database/entities/tenant/SubscriptionOrdersLineItems';
import { SubscriptionOrderMedia } from '../../database/entities/tenant/SubscriptionOrdersMedia';
import { Context } from '../../Interfaces/Auth';
import {
  IExtendedSubscriptionLineItems,
  ISubscriptionOrdersCount,
  ISubscriptionOrdersExtends,
  ITupleConditions,
} from '../../Interfaces/SubscriptionOrders';
import { IGeneralData, IRoutePlannerDetails } from '../../Interfaces/GeneralData';
import { IOrderBy, IWhere } from '../../Interfaces/GeneralsFilter';
import { getJobSiteSearchQuery } from '../../../src/services/hauling';

/**
 * Extendeds Subscription Order with external data.
 * @param ctx Koa Context.
 * @param so Subscription Order.
 * @returns An extended Subscription Order.
 */
const extendSubscriptionOrder = async (
  ctx: Context,
  so: SubscriptionOrders,
): Promise<ISubscriptionOrdersExtends | null> => {
  // Get Subscription linked to the Order
  const dataSource: DataSource = await BaseController.getDataSource(
    ctx.state.user.tenantName as string,
  );
  const subscription = await dataSource.getRepository(Subscriptions).findOneBy({
    id: so.subscriptionId,
  });
  const mediaFiles = await dataSource.getRepository(SubscriptionOrderMedia).findBy({
    subscriptionId: so.subscriptionId,
  });
  // Get Subscription Service Items linked to the Subscription
  const subscriptionServiceItem = await dataSource
    .getRepository(SubscriptionServiceItem)
    .findOneBy({ subscriptionId: so.subscriptionId });

  // Get Subscription order Line Items linked to the Subscription order (non-service order)
  const subscriptionOrderLineItems = await dataSource
    .getRepository(SubscriptionOrdersLineItems)
    .findBy({ subscriptionOrderId: so.id });

  await dataSource.destroy();

  const extendedSubscriptionLineItems2: IExtendedSubscriptionLineItems[] = await Promise.all(
    subscriptionOrderLineItems.map(async sli => {
      const response: IGeneralData = await getOrderData(ctx, {
        data: {
          billableLineItemId: sli.billableLineItemId,
        },
      });
      return { ...sli, historicalLineItem: response.billableLineItem };
    }),
  );
  if (!subscription || !subscriptionServiceItem) {
    return null;
  }

  // Get Hauling Data necesary to make the response
  const externalData: IGeneralData = await getOrderData(ctx, {
    data: {
      jobSiteId: subscription.jobSiteId,
      customerId_Histo: subscription.customerId,
      businessLineId: subscription.businessLineId,
      businessUnitId: subscription.businessUnitId,
      serviceAreaId: subscription.serviceAreaId,
      billableServiceId: so.billableServiceId,
      orderContactId: subscription.subscriptionContactId,
      materialId: subscriptionServiceItem.materialId,
      purchaseOrderId: so.purchaseOrderId,
      thirdPartyHaulerId: so.thirdPartyHaulerId,
    },
  });

  return {
    ...so,
    jobSite: externalData.jobSite,
    businessUnit: externalData.businessUnit,
    businessLine: externalData.businessLine,
    customer: externalData.customer,
    lineItems: extendedSubscriptionLineItems2,
    billableService: externalData.billableService,
    subscriptionServiceItem: { ...subscriptionServiceItem, material: externalData.material },
    subscriptionContact: externalData.orderContact,
    billableLineItemsTotal: subscriptionOrderLineItems.reduce(
      (val, sli) => sli.price * sli.quantity + val,
      0,
    ),
    purchaseOrder: externalData.purchaseOrder,
    thirdPartyHaulerDescription: externalData.thirdPartyHauler?.description,
    mediaFiles,
  };
};

enum SubscriptionSortBy {
  id = 'id',
  serviceDate = 'serviceDate',
  jobSite = 'jobSite',
  status = 'status',
}

export class SubscriptionOrdersController extends BaseController {
  async getSubscriptionOrders(ctx: Context) {
    const {
      limit,
      skip,
      sortBy,
      sortOrder,
      businessUnitId,
      status,
      filterByBusinessLine,
      filterByServiceDateFrom,
      filterByServiceDateTo,
      query,
    } = ctx.request.query;
    const { ids } = ctx.request.body;

    const requestJobSitesAndCustomers = { customer: [0], jobSites: [0] };
    if (query) {
      const requestResponse = await getJobSiteSearchQuery(ctx, {
        data: { searchQuery: query },
      });
      if (requestResponse.customer.length > 0) {
        requestJobSitesAndCustomers.customer = requestResponse.customer;
      }
      if (requestResponse.jobSites.length > 0) {
        requestJobSitesAndCustomers.jobSites = requestResponse.jobSites;
      }
    }

    // The following sort fields prefixes must match with bellow query builder entity aliases.
    // Unlike <<limit>> TypeORM function, <<take>> function work with query builder aliases instead of raw table names.
    const buildSortBy = (sortByString: string = ''): string => {
      switch (sortByString) {
        case SubscriptionSortBy.id:
          return 'subscriptionsOrders.sequenceId';
        case SubscriptionSortBy.jobSite:
          return 'subscription.jobSiteId';
        case SubscriptionSortBy.serviceDate:
          return 'subscriptionsOrders.serviceDate';
        case SubscriptionSortBy.status:
          return 'subscriptionsOrders.status';
        default:
          return '';
      }
    };

    let paramLimit: number = 25;
    let paramSkip: number = 0;
    const paramSortBy = buildSortBy(sortBy as string);
    let paramSortOrder = '';
    let paramStatus: IWhere = {};
    let paramsIds: IWhere = {};

    if (limit) {
      paramLimit = +limit;
    }
    if (skip) {
      paramSkip = +skip;
    }

    if (sortOrder) {
      paramSortOrder = sortOrder;
    }
    if (status) {
      if (status.toString() === 'FINALIZED') {
        paramStatus = { status: In(['FINALIZED', 'CANCELED']) };
      } else {
        paramStatus = { status: status.toString().toUpperCase() };
      }
    }
    if (!isEmpty(ids)) {
      paramsIds = { id: In(ids as number[]) };
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    let queryBuilder = dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionOrders, 'subscriptionsOrders')
      .innerJoinAndMapOne(
        'subscriptionsOrders.subscription',
        'Subscriptions',
        'subscription',
        `subscriptionsOrders.subscriptionId = subscription.id and subscription.businessUnitId = ${businessUnitId}`,
      )
      .leftJoinAndMapOne(
        'subscriptionsOrders.subscriptionServiceItem',
        'SubscriptionServiceItem',
        'serviceItem',
        'serviceItem.subscriptionId = subscriptionsOrders.subscriptionId',
      )
      .leftJoinAndMapMany(
        'subscriptionsOrders.lineItems',
        'SubscriptionOrdersLineItems',
        'subscriptionLineItem',
        'subscriptionsOrders.id = subscriptionLineItem.subscriptionOrderId',
      )
      .where({ ...paramStatus, ...paramsIds })
      .andWhere(`subscription.businessUnitId = ${businessUnitId}`);

    if (!isEmpty(filterByBusinessLine)) {
      queryBuilder = queryBuilder.andWhere(
        `subscription.businessLineId IN (${filterByBusinessLine})`,
      );
    }

    if (filterByServiceDateFrom && filterByServiceDateTo) {
      queryBuilder = queryBuilder.andWhere(
        `subscriptionsOrders.serviceDate >= '${filterByServiceDateFrom}' AND subscriptionsOrders.serviceDate < '${filterByServiceDateTo}'`,
      );
    }

    if (query) {
      queryBuilder = queryBuilder.andWhere(
        `subscription.jobSiteId IN (${requestJobSitesAndCustomers.jobSites.toString()}) OR subscription.customerId IN (${requestJobSitesAndCustomers.customer.toString()}) OR subscriptionsOrders.sequenceId LIKE :query`,
        {
          query: `%${query}%`,
        },
      );
    }

    queryBuilder = queryBuilder
      .skip(paramSkip)
      .take(paramLimit)
      .orderBy(paramSortBy, paramSortOrder.toUpperCase() as IOrderBy);

    const subscriptionOrders = (await queryBuilder.getMany()) as ISubscriptionOrdersExtends[];

    await dataSource.destroy();

    const getExtendedDataRecursive = async (
      edges: ISubscriptionOrdersExtends[],
      index: number = 0,
      nextEdges: ISubscriptionOrdersExtends[] = [],
    ) => {
      if (!edges[index]) {
        return nextEdges;
      }

      const so: ISubscriptionOrdersExtends = edges[index];
      const haulingRequestBody = {
        jobSiteId: so.subscription?.jobSiteId,
        customerId_Histo: so.subscription?.customerId,
        businessLineId: so.subscription?.businessLineId,
        businessUnitId: so.subscription?.businessUnitId,
        billableServiceId: so.billableServiceId,
      };
      const haulingResponse = await getOrderData(ctx, { data: haulingRequestBody });

      so.jobSite = haulingResponse.jobSite;
      so.businessUnit = haulingResponse.businessUnit;
      so.businessLine = haulingResponse.businessLine;
      so.customer = haulingResponse.customer;
      so.billableService = haulingResponse.billableService;
      nextEdges.push(so);

      const nextIndex = index + 1;
      if (edges[nextIndex]) {
        return getExtendedDataRecursive(edges, nextIndex, nextEdges);
      }

      return nextEdges;
    };

    const extendedSubscriptionOrders = await getExtendedDataRecursive(subscriptionOrders);

    const filteredSubsciptionOrders = extendedSubscriptionOrders;

    ctx.body = filteredSubsciptionOrders;
    ctx.status = 200;
  }

  async getDetailsForRoutePlanner(ctx: Context, next: Next) {
    const id = ctx.request.body.id;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscriptionOrder = (await dataSource
      .createQueryBuilder()
      .select('subscriptionOrder')
      .from(SubscriptionOrders, 'subscriptionOrder')
      .leftJoinAndSelect(
        'subscriptionOrder.subscriptionServiceItem',
        'serviceItem', // Row to map the information
      )
      .leftJoinAndMapOne(
        'subscriptionOrder.subscription', // Row to map the information
        'Subscriptions', // Entity or table
        'subscription', // Alias
        'subscriptionOrder.subscriptionId = subscription.id', //Condition
      )
      .where('"subscriptionOrder"."id" = :id', { id })
      .getOne()) as SubscriptionOrders;
    await dataSource.destroy();
    const response: IRoutePlannerDetails = {};
    response.businessUnitId = _.get(subscriptionOrder, ['subscription', 'businessUnitId']);
    response.businessLineId = _.get(subscriptionOrder, ['subscription', 'businessLineId']);
    response.jobSiteNote = subscriptionOrder.jobSiteNote;
    response.subscriptionId = subscriptionOrder.subscriptionId;

    response.serviceItemId = subscriptionOrder.subscriptionServiceItemId;

    const requestbody = {
      billableServiceId: subscriptionOrder.billableServiceId,
      jobSiteContactId: _.get(subscriptionOrder, ['subscription', 'jobSiteContactId']),
      materialId: _.get(subscriptionOrder, ['subscriptionServiceItem', 'materialId']),
      customerId_Histo: _.get(subscriptionOrder, ['subscription', 'customerId']),
      jobSiteId: _.get(subscriptionOrder, ['subscription', 'jobSiteId']),
      serviceAreaId: _.get(subscriptionOrder, ['subscription', 'serviceAreaId']),
    };

    const requestResponse = await getOrderData(ctx, { data: requestbody });

    const billableService = requestResponse.billableService;
    const jobSiteContact = requestResponse.jobSiteContact;
    const material = requestResponse.material;
    const customer = requestResponse.customer;
    const jobSite = requestResponse.jobSite;
    const serviceArea = requestResponse.serviceArea;

    const requestbodyEquipment = {
      equipmentItemId: _.get(billableService, 'equipmentItemId', undefined),
    };
    const requestResponseEquipment = await getOrderData(ctx, {
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
    ctx.status = 200;
    return next();
  }

  async validateOrders(ctx: Context, next: Next) {
    const { ids, businessUnitId, status } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscriptionOrdersData = await dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionOrders, 'subscriptionsOrders')
      .leftJoinAndMapOne(
        'subscriptionsOrders.subscription',
        'Subscriptions',
        'subscription',
        'subscriptionsOrders.subscriptionId = subscription.id',
      )
      .leftJoinAndMapOne(
        'subscriptionsOrders.SubscriptionWorkOrder',
        'SubscriptionWorkOrders',
        'SubWO',
        'SubWO.subscriptionOrderId = subscriptionsOrders.id',
      )
      .where({ status, completedAt: IsNull(), id: In(ids as number[]) })
      .andWhere(`subscription.businessUnitId = ${businessUnitId}`)
      .andWhere(
        `SubWO.truckNumber IS NULL AND SubWO.completedAt IS NULL AND SubWO.assignedRoute IS NULL`,
      )
      .getMany();

    await dataSource.destroy();
    ctx.body = subscriptionOrdersData;
    ctx.status = 200;
    next();
  }

  async getSubscriptionOrdersBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionOrders);
  }

  async addSubscriptionOrders(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionOrders, SubscriptionOrdersHistorical);
  }

  async bulkaddSubscriptionOrders(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    const { subscriptionId } = ctx.request.body[0];
    const subsOrdersTotalPrice = ctx.request.body?.reduce(
      (acc: number, subOrder) => acc + Number(subOrder.price) * Number(subOrder.quantity),
      0,
    );
    let response;
    try {
      response = super.bulkInserts(ctx, next, SubscriptionOrders, SubscriptionOrdersHistorical);
      const dataSource: DataSource = await BaseController.getDataSource(
        ctx.state.user.tenantName as string,
      );
      const subscription = await dataSource.manager.findOneBy(Subscriptions, {
        id: subscriptionId,
      });
      if (subscription) {
        subscription.billableSubscriptionOrdersTotal += subsOrdersTotalPrice;
        subscription.grandTotal += subsOrdersTotalPrice;
        subscription.beforeTaxesTotal += subsOrdersTotalPrice;
        await dataSource.manager.update(Subscriptions, { id: subscriptionId }, subscription);
      }
    } catch (error) {
      console.error(`Generation Subscription Order Error:${error}`);
    }
    return response;
  }

  async updateSubscriptionOrders(ctx: Context, next: Next) {
    ctx.request.body = validateStatusDate(
      ctx.request.body.status as string,
      ctx.request.body as SubscriptionOrders,
    );
    return super.update(ctx, next, SubscriptionOrders, SubscriptionOrdersHistorical);
  }

  async updateSubscriptionOrdersBySubsId(ctx: Context, next: Next) {
    const subscriptionId: number = +ctx.request.url.split('/')[4];
    ctx.request.body = validateStatusDate(
      ctx.request.body.status as string,
      ctx.request.body as SubscriptionOrders,
    );

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.update(
      SubscriptionOrders,
      { subscriptionId },
      ctx.request.body as QueryDeepPartialEntity<SubscriptionOrders>,
    );
    const data = await dataSource.manager.findOneBy(SubscriptionOrders, { subscriptionId });
    await dataSource.destroy();
    ctx.body = data;
    return next();
  }

  async deleteSubscriptionOrders(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionOrders, SubscriptionOrdersHistorical);
  }

  async getSequenceCount(ctx: Context, next: Next) {
    const subscriptionId = ctx.request.body.id;

    let response: number = 0;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const countRecurrentOrders = await dataSource
      .createQueryBuilder()
      .select('subscriptionOrders')
      .withDeleted()
      .from(SubscriptionOrders, 'subscriptionOrders')
      .where(`subscriptionOrders.subscriptionId = ${subscriptionId}`)
      .getCount();

    await dataSource.destroy();

    response = countRecurrentOrders;

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async getSubscriptionOrdersPaginated(ctx: Context, next: Next) {
    const subscriptionId: number = +ctx.request.url.split('/')[4];
    // Get Subscription Orders
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscriptionOrdersData = (await dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionOrders, 'subscriptionsOrders')
      .where({ subscriptionId })
      .getMany()) as ISubscriptionOrdersExtends[];

    // Get Subscription linked to the Order
    const subscriptionData = await dataSource
      .createQueryBuilder()
      .select('subscriptions')
      .from(Subscriptions, 'subscriptions')
      .where({ id: subscriptionId })
      .getOne();

    // Get Subscription Service Items linked to the Subscription
    const subscriptionServiceItem = await dataSource
      .createQueryBuilder()
      .select('subsServiceItem')
      .from(SubscriptionServiceItem, 'subsServiceItem')
      .where(`subsServiceItem.subscriptionId = ${subscriptionId}`)
      .getOne();

    // Get Subscription Line Items linked to the Subscription Service
    const subscriptionLineItems = await dataSource
      .createQueryBuilder()
      .select('subscriptionLineItem')
      .from(SubscriptionLineItem, 'subscriptionLineItem')
      .where({ subscriptionServiceItemId: subscriptionServiceItem?.id })
      .getMany();

    await dataSource.destroy();

    // Get Hauling Data necesary to make the response
    const haulingRequestRequestbody = {
      jobSiteId: subscriptionData?.jobSiteId,
      customerId: subscriptionData?.customerId,
      businessLineId: subscriptionData?.businessLineId,
      businessUnitId: subscriptionData?.businessUnitId,
      serviceAreaId: subscriptionData?.serviceAreaId,
      billableServiceId: subscriptionOrdersData[0].billableServiceId,
    };

    const haulingData = await getOrderData(ctx, {
      data: haulingRequestRequestbody,
    });

    for (let index = 0; index < subscriptionOrdersData.length; index++) {
      const subscriptionOrder: ISubscriptionOrdersExtends = subscriptionOrdersData[index];

      const haulingRequestBillable = {
        billableServiceId: subscriptionOrder.billableServiceId,
      };

      const haulingDataBillable = await getOrderData(ctx, {
        data: haulingRequestBillable,
      });

      subscriptionOrder.jobSite = haulingData.jobSite;
      subscriptionOrder.businessUnit = haulingData.businessUnit;
      subscriptionOrder.businessLine = haulingData.businessLine;
      subscriptionOrder.customer = haulingData.customer;
      subscriptionOrder.lineItems = subscriptionLineItems;
      subscriptionOrder.billableService = haulingDataBillable.billableService;
      if (subscriptionServiceItem) {
        subscriptionOrder.subscriptionServiceItem = subscriptionServiceItem;
      }

      subscriptionOrdersData[index] = subscriptionOrder;
    }

    ctx.body = subscriptionOrdersData;
    ctx.status = 200;
    return next();
  }

  async getBySubscriptionIds(ctx: Context, next: Next) {
    const {
      subscriptionIds,
      statuses,
      subscriptionServiceItemsIds,
      tupleConditions,
      types,
      excludeTypes,
    } = ctx.request.body;

    const preparedTupleConditions = unambiguousTupleCondition(
      'subscriptionsOrders',
      tupleConditions as ITupleConditions[],
    );
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    let qb = dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionOrders, 'subscriptionsOrders')
      .innerJoinAndMapMany(
        'subscriptionsOrders.subscriptionServiceItem',
        'SubscriptionServiceItem',
        'serviceItem',
        'serviceItem.id = subscriptionsOrders.subscriptionServiceItemId',
      )
      .where('serviceItem.subscriptionId IN (:...subscriptionIds)', {
        subscriptionIds,
      })
      .andWhere('subscriptionsOrders.deletedAt IS NULL')
      .andWhere('subscriptionsOrders.oneTime = false');

    if (statuses?.length) {
      qb = qb.andWhere('subscriptionsOrders.status IN (:...statuses)', {
        statuses,
      });
    }

    if (subscriptionServiceItemsIds?.length) {
      qb = qb.andWhere(
        'subscriptionsOrders.subscriptionServiceItemId IN (:...subscriptionServiceItemsIds)',
        {
          subscriptionServiceItemsIds,
        },
      );
    }

    preparedTupleConditions?.forEach(tupleCondition => {
      qb = qb.andWhere(tupleCondition[0]); //Pending validation
    });

    const response = (await qb.getMany()) as ISubscriptionOrdersExtends[];
    if (response.length) {
      for (let index = 0; index < response.length; index++) {
        const billableRequest = {
          id: response[index].billableServiceId,
          types,
          excludeTypes,
        };
        const haulingBillableService = await getBillableServiceBySubscription(ctx, {
          data: billableRequest,
        });
        response[index].billableService = haulingBillableService.billableService;
      }
    }

    await dataSource.destroy();

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async getById(ctx: Context, next: Next) {
    const subscriptionOrderId = Number.parseInt(ctx.params.id, 10);

    if (Number.isNaN(subscriptionOrderId)) {
      return next();
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscriptionOrder = (await dataSource
      .getRepository(SubscriptionOrders)
      .createQueryBuilder('so')
      .where('so.id = :id', { id: subscriptionOrderId })
      .getOne()) as SubscriptionOrders;

    await dataSource.destroy();

    ctx.body = await extendSubscriptionOrder(ctx, subscriptionOrder);
    ctx.status = 200;
    return next();
  }

  async getAllByIds(ctx: Context, next: Next) {
    const Ids: number[] = ctx.request.body.Ids;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    const response = await dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionOrders, 'subscriptionsOrders')
      .where({ id: In(Ids) })
      .getMany();

    await dataSource.destroy();

    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async softDeleteBy(ctx: Context) {
    const { subscriptionIds, statuses } = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    let qb = dataSource
      .createQueryBuilder()
      .select('subscriptionsOrders')
      .from(SubscriptionOrders, 'subscriptionsOrders')
      .where({
        id: In(subscriptionIds as number[]),
      })
      .andWhere({ deletedAt: IsNull() });

    if (statuses?.length) {
      qb = qb.andWhere({ status: In(statuses as string[]) });
    }
    const response = await qb.getMany();

    await dataSource.destroy();
    const dataSource2: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    if (response.length) {
      for (let index = 0; index < response.length; index++) {
        await dataSource2
          .createQueryBuilder()
          .softDelete()
          .from(SubscriptionOrders, 'subscriptionsOrders')
          .where({ id: response[index].id })
          .execute();
      }
    }

    await dataSource2.destroy();

    ctx.body = response;
    ctx.status = 200;
  }

  async updateStatusByIds(ctx: Context, next: Next) {
    const { ids, data } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    await dataSource
      .createQueryBuilder()
      .update(SubscriptionOrders)
      .set(data as QueryDeepPartialEntity<SubscriptionOrders>)
      .where({ id: In(ids as number[]) })
      .execute();

    const items: SubscriptionOrders[] = [];
    for (let index = 0; index < ids.length; index++) {
      const dataSO = await dataSource.manager.findOneBy(SubscriptionOrders, {
        id: ids[index],
      });
      items.push(dataSO as SubscriptionOrders);
      const historical = {
        ...dataSO,
        ...BaseController.historicalAttributes('edited', ids[index] as number, ctx),
      };
      await dataSource.manager.insert(
        SubscriptionOrdersHistorical,
        historical as unknown as QueryDeepPartialEntity<SubscriptionOrdersHistorical>,
      );
    }

    await dataSource.destroy();
    ctx.body = items;
    ctx.status = 200;
    return next();
  }

  async getSubscriptionOrdersCount(ctx: Context) {
    const businessUnitId = ctx.request.body.businessUnitId || ctx.request.query.businessUnitId;
    const dataSource = await BaseController.getDataSource(ctx.state.user.tenantName as string);
    const query = dataSource
      .createQueryBuilder()
      .select('so.status AS status')
      .addSelect('COUNT(so.status) AS count')
      .groupBy('so.status')
      .from(SubscriptionOrders, 'so')
      .innerJoin(Subscriptions, 's', 'so.subscriptionId = s.id')
      .where('s.businessUnitId = :businessUnitId', {
        businessUnitId: Number(businessUnitId),
      });
    const result: ISubscriptionOrdersCount[] = await query.execute();

    await dataSource.destroy();

    const summary = {
      total: 0,
      statuses: {
        SCHEDULED: 0,
        IN_PROGRESS: 0,
        BLOCKED: 0,
        SKIPPED: 0,
        COMPLETED: 0,
        APPROVED: 0,
        CANCELED: 0,
        FINALIZED: 0,
        INVOICED: 0,
        NEEDS_APPROVAL: 0,
      },
    };

    summary.total = result.map(s => Number(s.count)).reduce((t, v) => t + v, 0);
    result.map(s => (summary.statuses[s.status] = Number(s.count)));

    ctx.body = summary;
    ctx.status = 200;
  }

  async getNextServiceDateBySubscriptionId(ctx: Context, next: Next) {
    const subscriptionId = Number.parseInt(ctx.params.id, 10);

    if (Number.isNaN(subscriptionId)) {
      return next();
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscriptionOrder = await dataSource
      .getRepository(SubscriptionOrders)
      .createQueryBuilder('so')
      .where({ subscriptionId })
      .andWhere('so.status <> :status', {
        status: SUBSCRIPTION_ORDER_STATUS.canceled,
      })
      .andWhere('so.serviceDate >= :serviceDate', {
        serviceDate: new Date().toISOString(),
      })
      .orderBy('so.serviceDate', 'ASC')
      .getOne();

    await dataSource.destroy();
    ctx.body = subscriptionOrder;
    ctx.status = 200;
    return next();
  }
}
