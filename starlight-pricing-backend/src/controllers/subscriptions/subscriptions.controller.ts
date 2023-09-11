import { Next } from 'koa';
import { startOfToday } from 'date-fns';
import { DataSource, IsNull, In, Not } from 'typeorm';
import { isEmpty } from 'lodash';
import { SubscriptionsHistorical } from '../../database/entities/tenant/SubscriptionsHistorical';
import { Subscriptions } from '../../database/entities/tenant/Subscriptions';
import { SubscriptionOrders } from '../../database/entities/tenant/SubscriptionOrders';
import { BaseController } from '../base.controller';
import { subscriptionServiceName } from '../../utils/subscriptionServiceName';
import { SubscriptionServiceItem } from '../../database/entities/tenant/SubscriptionServiceItem';
import { SORT_ORDER } from '../../consts/sortOrders';
import { applyTenantToIndex, search } from '../../services/elasticSearch/elasticSearch';
import { TENANT_INDEX } from '../../consts/searchIndices';
import { SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX } from '../../consts/subscriptionAttributes';
import { SubscriptionsRespository } from '../../Repository/subscriptions/repository';
import {
  IQueryFiltersSub,
  ISubscriptionExtends,
  ISubscriptionsListBody,
  ISubscriptionsPaginatedQuery,
  ISummaryCount,
} from '../../Interfaces/Subscriptions';
import httpStatus from '../../consts/httpStatusCodes';
import { parseSearchQuery } from '../../utils/search';
import { mustFilterES } from '../../utils/mustFilterES';
import { IBool, IESSearch, IFiltersES } from '../../Interfaces/ElasticSearch';
import { searchSubscriptionsES } from '../../services/elasticSearch/subscriptions';
import { getJobSiteSearchQuery } from '../../services/hauling';
import { Context } from '../../Interfaces/Auth';
import { IOrderBy, IWhere } from '../../Interfaces/GeneralsFilter';
import { ISubscriptionServiceItem } from '../../Interfaces/SubscriptionServiceItem';
import { IGeneralData, IRequesParamsGeneral } from '../../Interfaces/GeneralData';
import { ICustomer } from '../../Interfaces/Customer';
import { IContact } from '../../Interfaces/Contact';
import { IJobSite } from '../../Interfaces/JobSite';
import { ISubscriptionOrders } from '../../Interfaces/SubscriptionOrders';
import { getOrderData } from './../../request/haulingRequest';

// Update the filters object based on thedata
const getfilters = (
  { customerId, businessLine, mine, email }: IQueryFiltersSub,
  filters: ISubscriptionsPaginatedQuery,
) => {
  if (customerId) {
    filters.customerId = customerId;
  }
  if (mine === 'true') {
    filters.csrEmail = email;
  }
  if (businessLine) {
    filters.businessLineId = businessLine;
  }
};

export class SubscriptionsController extends BaseController {
  async getSubscriptions(ctx: Context, next: Next) {
    return super.getAll(ctx, next, Subscriptions);
  }

  async getSubscriptionsBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, Subscriptions);
  }

  async addSubscriptions(ctx: Context, next: Next) {
    return super.insert(ctx, next, Subscriptions, SubscriptionsHistorical);
  }

  async updateSubscriptions(ctx: Context, next: Next) {
    const id: number = +ctx.request.url.split('/')[4] || ctx.request.body.subscriptionId;
    const subscription: Subscriptions = ctx.request.body;
    // disable because entity is always "Date" but it is nullable, so we need this validation
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (subscription.endDate) {
      const dataSource: DataSource = await BaseController.getDataSource(
        ctx.state.user.tenantName as string,
        false,
      );
      const serviceItems: ISubscriptionServiceItem[] = await dataSource.manager
        .createQueryBuilder()
        .select('serviceItems')
        .from(SubscriptionServiceItem, 'serviceItems')
        .leftJoinAndMapMany(
          'serviceItems.lineItems', // Row to map the information
          'SubscriptionLineItem', // Entity or table
          'lineItems', // Alias
          'serviceItems.id = lineItems.subscriptionServiceItemId', //Condition
        )
        .leftJoinAndMapMany(
          'serviceItems.subscriptionOrders', // Row to map the information
          'SubscriptionOrders', // Entity or table
          'subscriptionOrders', // Alias
          'serviceItems.id = subscriptionOrders.subscriptionServiceItemId', //Condition
        )
        .where({ subscriptionId: id })
        .andWhere({ billingCycle: Not(IsNull()) })
        .getMany();
      for (let index = 0; index < serviceItems.length; index++) {
        const service = serviceItems[index];
        const subOrdersToDelete: number[] = [];
        service.subscriptionOrders?.map(subOrder => {
          if (new Date(subscription.endDate) < new Date(subOrder.serviceDate)) {
            subOrdersToDelete.push(subOrder.id);
          }
          return subOrder;
        });

        if (subOrdersToDelete.length > 0) {
          await dataSource.manager.delete(SubscriptionOrders, {
            id: In(subOrdersToDelete),
            status: 'SCHEDULED',
          });
        }

        await dataSource.destroy();
      }
    }
    return super.update(ctx, next, Subscriptions, SubscriptionsHistorical, id);
  }

  async deleteSubscriptions(ctx: Context, next: Next) {
    ctx.request.body = ctx.query;
    return super.delete(ctx, next, Subscriptions);
  }

  async getSubscription(ctx: Context) {
    const subscriptionId: number = ctx.request.body.id;
    const customerId: number = ctx.request.body.customerId;

    const whereFilter: IWhere = { id: subscriptionId };
    if (customerId) {
      whereFilter.customerId = customerId;
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = (await dataSource.manager
      .createQueryBuilder()
      .select('subscription')
      .from(Subscriptions, 'subscription')
      .where(whereFilter)
      .getOne()) as ISubscriptionExtends | null;

    if (!data) {
      ctx.body = undefined;
      ctx.status = httpStatus.BAD_REQUEST;
      return;
    }

    const haulingRequestRequestbody: IRequesParamsGeneral = {
      jobSiteId: data.jobSiteId,
      customerId_Histo: data.customerId,
      businessLineId: data.businessLineId,
      businessUnitId: data.businessUnitId,
      jobSiteContactId: data.jobSiteContactId,
      orderContactId: data.subscriptionContactId,
      purchaseOrderId: data.purchaseOrderId,
      customerJobSiteId: data.customerJobSiteId,
      thirdPartyHaulerId: data.thirdPartyHaulerId,
    };
    if (data.status === 'draft') {
      haulingRequestRequestbody.serviceAreaId_Histo = data.serviceAreaId;
      haulingRequestRequestbody.jobSiteId_Histo = data.jobSiteId;
    } else {
      haulingRequestRequestbody.serviceAreaId = data.serviceAreaId;
      haulingRequestRequestbody.jobSiteId = data.jobSiteId;
    }
    const haulingData: IGeneralData = await getOrderData(ctx, {
      data: haulingRequestRequestbody,
    });

    data.customer = haulingData.customer;
    data.jobSite = haulingData.jobSite;
    data.businessLine = haulingData.businessLine;
    data.businessUnit = haulingData.businessUnit;
    data.serviceArea = haulingData.serviceArea;
    data.billableService = haulingData.billableService;
    data.jobSiteContact = haulingData.jobSiteContact;
    data.subscriptionContact = haulingData.orderContact;
    data.purchaseOrder = haulingData.purchaseOrder;
    data.customerJobSite = haulingData.customerJobSite;
    data.thirdPartyHauler = haulingData.thirdPartyHauler;
    data.csr = ctx.state.user;

    const serviceItems: ISubscriptionServiceItem[] = await dataSource.manager
      .createQueryBuilder()
      .select('serviceItems')
      .from(SubscriptionServiceItem, 'serviceItems')
      .leftJoinAndMapMany(
        'serviceItems.lineItems', // Row to map the information
        'SubscriptionLineItem', // Entity or table
        'lineItems', // Alias
        'serviceItems.id = lineItems.subscriptionServiceItemId', //Condition
      )
      .leftJoinAndMapMany(
        'serviceItems.subscriptionOrders', // Row to map the information
        'SubscriptionOrders', // Entity or table
        'subscriptionOrders', // Alias
        'serviceItems.id = subscriptionOrders.subscriptionServiceItemId', //Condition
      )
      .where({ subscriptionId: data.id })
      .andWhere({ billingCycle: Not(IsNull()) })
      .getMany();

    for (let index = 0; index < serviceItems.length; index++) {
      const element = serviceItems[index];
      const ids: number[] = [];
      const requestbody1: IRequesParamsGeneral = {
        materialId: element.materialId,
        billableServiceId: element.billableServiceId,
      };
      if (serviceItems[index].serviceFrequencyId) {
        ids.push(serviceItems[index].serviceFrequencyId);
        requestbody1.frequencyIds = ids;
      }
      const haulingData1 = await getOrderData(ctx, { data: requestbody1 });
      element.billableService = haulingData1.billableService;
      if (haulingData1.material) {
        element.material = haulingData1.material;
      }
      if (haulingData1.frequencies) {
        element.serviceFrequency = haulingData1.frequencies;
        data.serviceFrequencyAggregated = haulingData1.frequencies[0];
      }

      element.subscriptionOrders = await Promise.all(
        element.subscriptionOrders?.map(async subsOrder => {
          const requestbody2 = {
            billableServiceId: subsOrder.billableServiceId,
          };
          const haulingDataSubsOrder: IGeneralData = await getOrderData(ctx, {
            data: requestbody2,
          });
          return Object.assign(subsOrder, haulingDataSubsOrder);
        }) ?? [],
      );

      element.lineItems = await Promise.all(
        element.lineItems?.map(async lineItem => {
          const requestbody3 = {
            billableLineItemId: lineItem.billableLineItemId,
          };
          const haulingDataLineItem = await getOrderData(ctx, {
            data: requestbody3,
          });
          return Object.assign(lineItem, haulingDataLineItem);
        }) ?? [],
      );
    }
    data.serviceName = subscriptionServiceName(serviceItems);
    data.serviceItems = serviceItems;

    const serviceData = (await dataSource
      .createQueryBuilder()
      .select('subsOrders')
      .from(SubscriptionOrders, 'subsOrders')

      .leftJoinAndMapOne(
        'subsOrders.tempNextServiceDate',
        'SubscriptionServiceItem',
        'subServiceItem',
        'subsOrders.subscriptionServiceItemId = subServiceItem.id',
      )
      .where({ subscriptionId })
      .getMany()) as ISubscriptionOrders[];

    await dataSource.destroy();

    const nextServiceDate = serviceData.find(
      (servicedate: ISubscriptionOrders) => (servicedate.tempNextServiceDate.id = data.id),
    )?.serviceDate;

    data.nextServiceDate = nextServiceDate;
    ctx.body = data;
    ctx.status = 200;
  }

  async getSubscriptionsList(ctx: Context) {
    const {
      businessUnitId,
      csrEmail,
      customerId,
      status,
      skip = 0,
      limit = 25,
      subIds,
    } = ctx.request.body as ISubscriptionsListBody;

    const whereFilter: IWhere = {};

    if (!isEmpty(subIds)) {
      whereFilter.id = In(subIds as number[]);
    }

    if (businessUnitId) {
      whereFilter.businessUnitId = businessUnitId;
    }

    if (csrEmail) {
      whereFilter.csrEmail = csrEmail;
    }

    if (status) {
      whereFilter.status = status;
    }

    if (customerId) {
      whereFilter.customerId = customerId;
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = (await dataSource
      .createQueryBuilder()
      .select([
        'subscriptions.id',
        'subscriptions.csrEmail',
        'subscriptions.status',
        'subscriptions.startDate',
        'subscriptions.endDate',
        'subscriptions.equipmentType',
        'subscriptions.paymentMethod',
        'subscriptions.grandTotal',
        'subscriptions.billingCycle',
        'subscriptions.billingType',
        'subscriptions.createdAt',
        'subscriptions.updatedAt',
        'subscriptions.jobSiteId',
        'subscriptions.businessLineId',
        'subscriptions.businessUnitId',
        'subscriptions.serviceAreaId',
        'subscriptions.customerId',
      ])
      .from(Subscriptions, 'subscriptions')
      .where(whereFilter)
      .skip(skip)
      .take(limit)
      .getMany()) as ISubscriptionExtends[];

    let response: ISubscriptionExtends[] = [];

    response = await Promise.all(
      data.map(async (elementSubs: ISubscriptionExtends) => {
        const requestbody = {
          jobSiteId: elementSubs.jobSiteId,
          customerId_Histo: elementSubs.customerId,
          businessLineId: elementSubs.businessLineId,
          businessUnitId: elementSubs.businessUnitId,
          serviceAreaId: elementSubs.serviceAreaId,
        };
        const haulingData = await getOrderData(ctx, { data: requestbody });

        const serviceItems: ISubscriptionServiceItem[] = await dataSource.manager
          .createQueryBuilder()
          .select('serviceItems')
          .from(SubscriptionServiceItem, 'serviceItems')
          .leftJoinAndMapMany(
            'serviceItems.lineItems', // Row to map the information
            'SubscriptionLineItem', // Entity or table
            'lineItems', // Alias
            'serviceItems.id = lineItems.subscriptionServiceItemId', //Condition
          )
          .leftJoinAndMapMany(
            'serviceItems.subscriptionOrders', // Row to map the information
            'SubscriptionOrders', // Entity or table
            'subscriptionOrders', // Alias
            'serviceItems.id = subscriptionOrders.subscriptionServiceItemId', //Condition
          )
          .where({ subscriptionId: elementSubs.id })
          .andWhere({ billingCycle: Not(IsNull()) })
          .getMany();

        for (let index = 0; index < serviceItems.length; index++) {
          const element = serviceItems[index];
          const ids: number[] = [];
          const requestbody1: IRequesParamsGeneral = {
            materialId: element.materialId,
            billableServiceId: element.billableServiceId,
          };
          if (serviceItems[index].serviceFrequencyId) {
            ids.push(serviceItems[index].serviceFrequencyId);
            requestbody1.frequencyIds = ids;
          }
          const serviceItemsData = await getOrderData(ctx, { data: requestbody1 });
          element.billableService = serviceItemsData.billableService;
          if (serviceItemsData.material) {
            element.material = serviceItemsData.material;
          }
          if (serviceItemsData.frequencies) {
            element.serviceFrequency = serviceItemsData.frequencies;
            elementSubs.serviceFrequencyAggregated = serviceItemsData.frequencies[0];
          }

          element.subscriptionOrders = await Promise.all(
            element.subscriptionOrders?.map(async subsOrder => {
              const requestbody2 = {
                billableServiceId: subsOrder.billableServiceId,
              };
              const haulingDataSubsOrder: IGeneralData = await getOrderData(ctx, {
                data: requestbody2,
              });
              return Object.assign(subsOrder, haulingDataSubsOrder);
            }) ?? [],
          );
          element.lineItems = await Promise.all(
            element.lineItems?.map(async lineItem => {
              const requestbody3 = {
                billableLineItemId: lineItem.billableLineItemId,
              };
              const haulingDataLineItem = await getOrderData(ctx, {
                data: requestbody3,
              });
              return Object.assign(lineItem, haulingDataLineItem);
            }) ?? [],
          );
        }
        elementSubs.serviceName = subscriptionServiceName(serviceItems);
        elementSubs.serviceItems = serviceItems;

        const serviceData = (await dataSource
          .createQueryBuilder()
          .select('subsOrders')
          .from(SubscriptionOrders, 'subsOrders')
          .leftJoinAndMapOne(
            'subsOrders.tempNextServiceDate',
            'SubscriptionServiceItem',
            'subServiceItem',
            'subsOrders.subscriptionServiceItemId = subServiceItem.id',
          )
          .where({ subscriptionId: elementSubs.id })
          .getMany()) as ISubscriptionOrders[];

        const nextServiceDate = serviceData.find(
          (servicedate: ISubscriptionOrders) =>
            (servicedate.tempNextServiceDate.id = elementSubs.id),
        )?.serviceDate;

        return {
          ...elementSubs,
          serviceArea: haulingData.serviceArea,
          jobSite: haulingData.jobSite,
          customer: haulingData.customer,
          businessLine: haulingData.businessLine,
          businessUnit: haulingData.businessUnit,
          nextServiceDate,
        };
      }),
    );
    await dataSource.destroy();

    ctx.body = response;
    ctx.status = 200;
  }

  async getSubscriptionsListToInvoice(ctx: Context) {
    const { businessUnitId, csrEmail, customerId, status, subIds } = ctx.request.body;

    const whereFilter: IWhere = {};

    if (subIds) {
      whereFilter.id = In(subIds as number[]);
    }

    if (businessUnitId) {
      whereFilter.businessUnitId = businessUnitId;
    }

    if (csrEmail) {
      whereFilter.csrEmail = csrEmail;
    }

    if (status) {
      whereFilter.status = status;
    }

    if (customerId) {
      whereFilter.customerId = customerId;
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource
      .createQueryBuilder()
      .select([
        'subscriptions.id',
        'subscriptions.nextBillingPeriodFrom',
        'subscriptions.nextBillingPeriodTo',
        'subscriptions.invoicedDate',
        'subscriptions.billingCycle',
        'subscriptions.customerId',
      ])
      .from(Subscriptions, 'subscriptions')
      .where(whereFilter)
      .getMany();

    await dataSource.destroy();
    const response = data;

    ctx.body = response;
    ctx.status = 200;
  }

  async getSubscriptionsCount(ctx: Context) {
    const { businessUnitId, customerId, csrEmail } = ctx.request.body;

    const summary: ISummaryCount = {
      total: 0,
      statuses: { active: 0, closed: 0, draft: 0, onHold: 0 },
    };

    const whereFilter: IWhere = {};

    if (businessUnitId) {
      whereFilter.businessUnitId = businessUnitId;
    }

    if (csrEmail) {
      whereFilter.csrEmail = csrEmail;
    }

    if (customerId) {
      whereFilter.customerId = customerId;
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    const statusCounts = await dataSource
      .createQueryBuilder()
      .select('status')
      .addSelect('COUNT(*) as count')
      .from(Subscriptions, 'subscriptions')
      .where(whereFilter)
      .groupBy('status')
      .getRawMany();

    statusCounts.forEach((item: { status: string; count: string }) => {
      summary.total += parseInt(item.count, 10);
      switch (item.status) {
        case 'active':
          summary.statuses.active = parseInt(item.count, 10);
          break;
        case 'closed':
          summary.statuses.closed = parseInt(item.count, 10);
          break;
        case 'draft':
          summary.statuses.draft = parseInt(item.count, 10);
          break;
        case 'onHold':
          summary.statuses.onHold = parseInt(item.count, 10);
          break;
        default:
          break;
      }
    });

    ctx.body = summary;
    ctx.status = 200;
    await dataSource.destroy();
  }

  async getDraftSubscription(ctx: Context) {
    const subscriptionId = ctx.request.body.id;
    const customerId = ctx.request.body.customerId;

    const whereFilter: IWhere = { id: subscriptionId };
    if (customerId) {
      whereFilter.customerId = customerId;
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscriptionData = (await dataSource.manager
      .createQueryBuilder()
      .select('subscriptions')
      .from(Subscriptions, 'subscriptions')
      .where(whereFilter)
      .getOne()) as ISubscriptionExtends | null;

    if (subscriptionData) {
      const haulingRequestRequestbody: IRequesParamsGeneral = {
        jobSiteId: subscriptionData.jobSiteId,
        customerId: subscriptionData.customerId,
        businessLineId: subscriptionData.businessLineId,
        businessUnitId: subscriptionData.businessUnitId,
        serviceAreaId: subscriptionData.serviceAreaId,
        // billableServiceId: subscriptionData.billableServiceId, *** This value doesn't not exist in the Subscriptions table ***
        jobSiteContactId: subscriptionData.jobSiteContactId,
        purchaseOrderId: subscriptionData.purchaseOrderId,
      };

      const haulingData = await getOrderData(ctx, {
        data: haulingRequestRequestbody,
      });

      subscriptionData.customer = haulingData.customer;
      subscriptionData.jobSite = {
        ...haulingData.jobSite,
        originalId: subscriptionData.jobSiteId,
      } as IJobSite;
      subscriptionData.customer = {
        ...haulingData.customer,
        originalId: subscriptionData.customerId,
      } as ICustomer;
      subscriptionData.businessLine = haulingData.businessLine;
      subscriptionData.businessUnit = haulingData.businessUnit;
      subscriptionData.serviceArea = haulingData.serviceArea;
      subscriptionData.billableService = haulingData.billableService;
      subscriptionData.jobSiteContact = haulingData.jobSiteContact;
      subscriptionData.subscriptionContact = {
        ...haulingData.orderContact,
        originalId: subscriptionData.subscriptionContactId,
      } as IContact;
      subscriptionData.bestTimeToComeFrom = ''; //todo
      subscriptionData.bestTimeToComeTo = ''; //todo
      subscriptionData.nextBillingPeriodFrom = subscriptionData.createdAt; //todo
      subscriptionData.nextBillingPeriodTo = subscriptionData.createdAt; //todo
      subscriptionData.serviceName = subscriptionData.equipmentType;
      subscriptionData.purchaseOrder = haulingData.purchaseOrder;
      subscriptionData.competitor = null; //todo
      subscriptionData.lineItems = []; //TODO: fix this later
    }

    ctx.body = subscriptionData;
    ctx.status = 200;
    await dataSource.destroy();
  }

  async closeEndingSubscriptions(ctx: Context) {
    const ids: number[] = ctx.request.body.ids;

    const dataSource = await BaseController.getDataSource(ctx.state.user.tenantName as string);

    const subscriptionsToClose = await dataSource
      .getRepository(Subscriptions)
      .findBy({ id: In(ids) });

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const updatePayload = {
        status: 'closed',
        reason: 'Subscription has been expired',
      };
      await queryRunner.manager.update(Subscriptions, { id: In(ids) }, updatePayload);

      await Promise.all(
        subscriptionsToClose.map(async s => {
          const historicalSubscription = {
            ...s,
            ...updatePayload,
            ...BaseController.historicalAttributes('edited', s.id, ctx),
          };
          await queryRunner.manager.insert(SubscriptionsHistorical, historicalSubscription);
        }),
      );

      await queryRunner.commitTransaction();
    } catch (e: unknown) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    await dataSource.destroy();

    ctx.body = ids;
    ctx.status = 200;
  }

  async getEndingSubscriptions(ctx: Context) {
    const dataSource = await BaseController.getDataSource(ctx.state.user.tenantName as string);
    const endingSubscriptions = await dataSource
      .getRepository(Subscriptions)
      .createQueryBuilder('s')
      .where('s.status <> :status', { status: 'closed' })
      .andWhere('s.endDate < :now', { now: startOfToday() })
      .getMany();

    await dataSource.destroy();

    ctx.status = 200;
    ctx.body = endingSubscriptions;
  }

  async getSubscriptionsServiceItems(ctx: Context) {
    const dataSource = await BaseController.getDataSource(ctx.state.user.tenantName as string);

    const {
      businessUnitId,
      businessLineIds = [],
      thirdPartyHaulerId,
      frequencyIds,
      status,
      serviceIds,
      skip,
      limit,
      sortOrder,
      sortBy,
      onlyServices,
      idsToSort,
    } = ctx.request.body;

    const whereFilter: IWhere = {};
    if (frequencyIds) {
      whereFilter.serviceFrequencyId = In(frequencyIds as number[]);
    }
    let query = dataSource
      .getRepository(SubscriptionServiceItem)
      .createQueryBuilder('subscriptionServiceItem')
      .innerJoinAndMapOne(
        'subscriptionServiceItem.subscription',
        'Subscriptions',
        'subscription',
        `subscription.id = subscriptionServiceItem.subscriptionId AND ` +
          `subscription.businessUnitId = ${businessUnitId} AND ` +
          `subscription.status = '${status}'`,
      )
      .where(whereFilter)
      .limit(limit as number)
      .offset(skip as number);

    if (!isEmpty(onlyServices)) {
      query = query.where(`service_frequency_id IN(${onlyServices})`);
    }

    if (['subscription_id', 'service_frequency_id'].includes(sortBy as string)) {
      query = query.orderBy(sortBy as string, sortOrder.toUpperCase() as IOrderBy);
    }
    if (!isEmpty(idsToSort) && sortBy) {
      const subQuerySort = `${(idsToSort as number[])
        .map((val: number, idx: number) => `WHEN ${val} THEN ${idx}`)
        .join(' ')} END`;

      switch (sortBy) {
        case 'materialName':
          query = query.orderBy(`CASE subscriptionServiceItem.material_id ${subQuerySort}`);
          break;
        case 'customerName':
          query = query.orderBy(
            `CASE subscription.customer_id ${subQuerySort}`,
            'DESC', // the real sort was ordered in the hauling BE
          );
          break;
        case 'jobSiteName':
          query = query.orderBy(`CASE subscription.job_site_id ${subQuerySort}`);
          break;
        case 'equipmentSize':
          query = query.orderBy(`CASE subscriptionServiceItem.billable_service_id ${subQuerySort}`);
          break;
        case 'serviceName':
          query = query.orderBy(`CASE subscriptionServiceItem.billable_service_id ${subQuerySort}`);
          break;
        default:
          break;
      }
      if (
        ['master_routes.name', 'sequence', 'service_item_master_route.service_day'].includes(
          sortBy as string,
        )
      ) {
        query = query.orderBy(`CASE subscriptionServiceItem.id ${subQuerySort}`);
      }
    }
    if (!isEmpty(businessLineIds)) {
      query = query.andWhere('subscription.businessLineId IN(:...ids)', {
        ids: businessLineIds as number[],
      });
    }

    if (!isEmpty(serviceIds)) {
      query = query.andWhere('subscriptionServiceItem.id IN(:...serviceIds)', { serviceIds });
    }

    if (thirdPartyHaulerId) {
      query = query.andWhere(`subscription.thirdPartyHaulerId = ${thirdPartyHaulerId}`);
    }

    const subscriptionsServiceItems = await query.getMany();

    await dataSource.destroy();
    ctx.status = 200;
    ctx.body = subscriptionsServiceItems;
  }

  async getSubscriptionsPaginated(ctx: Context) {
    const subscriptionsRespository = new SubscriptionsRespository();
    const { email, schemaName } = ctx.state.user;
    const {
      skip = 0,
      limit = 25,
      mine,
      sortBy = 'id',
      sortOrder = SORT_ORDER.asc,
      businessLine,
      ...filters
    } = ctx.request.query as ISubscriptionsPaginatedQuery;

    getfilters({ mine, email, businessLine }, filters); //update filters

    let bool;
    const sort = [{ [SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX[sortBy]]: sortOrder }];

    if (!isEmpty(Object.keys(filters))) {
      const must = Object.keys(filters).map(key => {
        return { match: { [key]: filters[key] } };
      });
      bool = { must };
    }
    const subscriptionsResult = await search<ISubscriptionExtends>(
      ctx,
      TENANT_INDEX.subscriptions,
      applyTenantToIndex(TENANT_INDEX.subscriptions, schemaName),
      {
        skip: Number(skip),
        limit: Math.min(Number(limit)),
        ...filters,
        sort,
        bool,
      },
    );

    let subscriptions: ISubscriptionExtends[] = [];
    if (subscriptionsResult?.subscriptions) {
      subscriptions = await subscriptionsRespository.extendSubscription(
        ctx,
        subscriptionsResult.subscriptions,
      );

      switch (sortBy) {
        case 'customerName':
          subscriptions.sort((a, b) => {
            return sortOrder === 'asc'
              ? a.customer?.name.localeCompare(b.customer?.name ?? '') ?? 0
              : b.customer?.name.localeCompare(a.customer?.name ?? '') ?? 0;
          });
          break;

        case 'serviceFrequency':
          subscriptions.sort((a, b) => {
            return sortOrder === 'asc'
              ? (a.serviceFrequencyAggregated.times ?? 0) <
                (b.serviceFrequencyAggregated.times ?? 0)
                ? -1
                : 1
              : (a.serviceFrequencyAggregated.times ?? 0) >
                (b.serviceFrequencyAggregated.times ?? 0)
              ? -1
              : 1;
          });
          break;

        case 'nextServiceDate':
          subscriptions.sort((a, b) => {
            return sortOrder === 'asc'
              ? Number(new Date(a.nextServiceDate ?? '')) -
                  Number(new Date(b.nextServiceDate ?? ''))
              : Number(new Date(b.nextServiceDate ?? '')) -
                  Number(new Date(a.nextServiceDate ?? ''));
          });
          break;

        default:
          break;
      }
    }
    ctx.body = subscriptions;
    ctx.status = httpStatus.OK;
  }

  async getSubscriptionsWithoutEndDate(ctx: Context) {
    const subscriptionsRespository = new SubscriptionsRespository();
    const { schemaName } = ctx.state.user;
    const filters = { status: 'active' };
    const filtersNull = { field: 'endDate' };

    const must = Object.keys(filters).map(key => {
      return { match: { [key]: filters[key] } };
    });
    const must_not = Object.keys(filtersNull).map(key => {
      return { exists: { [key]: filtersNull[key] } };
    });
    const bool = { must, must_not };
    const subscriptionsResult = await search<ISubscriptionExtends>(
      ctx,
      TENANT_INDEX.subscriptions,
      applyTenantToIndex(TENANT_INDEX.subscriptions, schemaName),
      {
        ...filters,
        bool,
      },
    );
    let subscriptions: ISubscriptionExtends[] = [];
    if (subscriptionsResult?.subscriptions) {
      subscriptions = await subscriptionsRespository.extendSubscription(
        ctx,
        subscriptionsResult.subscriptions,
      );
    }
    ctx.body = subscriptions;
    ctx.status = httpStatus.OK;
  }

  async streamTenant(ctx: Context, next: Next) {
    const subscriptionsRespository = new SubscriptionsRespository();
    const { tenantName } = ctx.request.body;
    const dataSource = await BaseController.getDataSource(tenantName as string);
    const subscriptionData: ISubscriptionExtends[] = await dataSource.manager
      .createQueryBuilder()
      .from(Subscriptions, 'subscriptions')
      .select('*')
      .execute();

    let subscriptions: ISubscriptionExtends[] = [];
    if (!isEmpty(subscriptionData)) {
      subscriptions = await subscriptionsRespository.extendSubscriptionTenant(
        ctx,
        subscriptionData,
        tenantName as string,
      );
    }
    ctx.body = subscriptions;
    ctx.status = 200;
    return next();
  }

  async getSearch(ctx: Context) {
    const {
      query,
      skip = 0,
      limit = 25,
      customerId,
      businessLine,
      mine,
      sortBy = 'id',
      sortOrder = SORT_ORDER.asc,
      ...filters
    } = ctx.request.query as ISubscriptionsPaginatedQuery;
    const subscriptionsRespository = new SubscriptionsRespository();
    const { email, schemaName } = ctx.state.user;
    const { searchId, searchQuery } = parseSearchQuery(query as string);
    getfilters({ customerId, mine, email, businessLine }, filters); //update filters
    const sort = [{ [SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX[sortBy]]: sortOrder }];
    const mainFilter = {
      skip: Number(skip),
      limit: Number(limit),
      sort,
    };
    let subscriptionsResult: ISubscriptionExtends[] = [];
    if (searchQuery) {
      const requestResponse = await getJobSiteSearchQuery(ctx, {
        data: { searchQuery },
      });
      if (requestResponse.jobSites) {
        const newBool: IBool = mustFilterES(filters as IFiltersES);
        const filter = [
          {
            terms: {
              jobSiteId: requestResponse.jobSites,
            },
          },
        ];
        newBool.filter = filter;
        const subByJobSite = await searchSubscriptionsES(ctx, schemaName as string, {
          ...mainFilter,
          ...filters,
          bool: newBool,
        });
        if (subByJobSite?.subscriptions) {
          subscriptionsResult = [...subByJobSite.subscriptions, ...subscriptionsResult];
        }
      }
      if (requestResponse.customer) {
        const newBool: IBool = mustFilterES(filters as IFiltersES);
        const filter = [
          {
            terms: {
              customerId: requestResponse.customer,
            },
          },
        ];
        newBool.filter = filter;
        const subByCustomer = await searchSubscriptionsES(ctx, schemaName as string, {
          ...mainFilter,
          ...filters,
          bool: newBool,
        });
        if (subByCustomer?.subscriptions) {
          subscriptionsResult = [...subByCustomer.subscriptions, ...subscriptionsResult];
        }
      }
    }
    if (searchId) {
      filters.id = searchId;
      const newBool = mustFilterES(filters as IFiltersES);
      const subById: IESSearch<ISubscriptionExtends> | null = await searchSubscriptionsES(
        ctx,
        schemaName as string,
        {
          ...mainFilter,
          ...filters,
          bool: newBool,
        },
      );
      subscriptionsResult = subById
        ? [...subById.subscriptions, ...subscriptionsResult]
        : subscriptionsResult;
    }
    let subscriptions: ISubscriptionExtends[] = [];
    if (!isEmpty(subscriptionsResult)) {
      subscriptions = await subscriptionsRespository.extendSubscription(ctx, subscriptionsResult);
      switch (sortBy) {
        case 'customerName':
          subscriptions.sort((a, b) => {
            return sortOrder === 'asc'
              ? a.customer?.name.localeCompare(b.customer?.name ?? '') ?? 0
              : b.customer?.name.localeCompare(a.customer?.name ?? '') ?? 0;
          });
          break;

        case 'serviceFrequency':
          subscriptions.sort((a, b) => {
            return sortOrder === 'asc'
              ? (a.serviceFrequencyAggregated.times ?? 0) <
                (b.serviceFrequencyAggregated.times ?? 0)
                ? -1
                : 1
              : (a.serviceFrequencyAggregated.times ?? 0) >
                (b.serviceFrequencyAggregated.times ?? 0)
              ? -1
              : 1;
          });
          break;

        case 'nextServiceDate':
          subscriptions.sort((a, b) => {
            return sortOrder === 'asc'
              ? Number(new Date(a.nextServiceDate ?? '')) -
                  Number(new Date(b.nextServiceDate ?? ''))
              : Number(new Date(b.nextServiceDate ?? '')) -
                  Number(new Date(a.nextServiceDate ?? ''));
          });
          break;

        default:
          break;
      }
    }

    ctx.body = subscriptions;
    ctx.status = httpStatus.OK;
  }
}
