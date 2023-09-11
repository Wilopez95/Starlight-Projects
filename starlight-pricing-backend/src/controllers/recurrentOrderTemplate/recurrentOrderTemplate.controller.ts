import { Next } from 'koa';
import { DataSource, ObjectLiteral } from 'typeorm';
import { isEmpty } from 'lodash';
import { RecurrentOrderTemplate } from '../../database/entities/tenant/RecurrentOrderTemplates';
import { RecurrentOrderTemplateHistorical } from '../../database/entities/tenant/RecurrentOrderTemplatesHistorical';
import { BaseController } from '../base.controller';
import httpStatus from '../../consts/httpStatusCodes';
import { ORDER_STATUS, RECURRENT_TEMPLATE_STATUS } from '../../consts/orderStatuses';
import { RecurrentOrderTemplateOrder } from '../../database/entities/tenant/RecurrentOrderTemplateOrder';
import ApiError from '../../utils/ApiError';
import { Orders } from '../../database/entities/tenant/Orders';
import { IBody, ISort, IWhere } from '../../Interfaces/GeneralsFilter';
import { Context } from '../../Interfaces/Auth';
import { IGeneralData } from '../../Interfaces/GeneralData';
import {
  IRecurrentOrderFull,
  IRecurrentOrderTemplateGeneratedOrders,
  IRecurrentOrderTemplateGeneratedOrdersResponse,
} from '../../Interfaces/RecurrentOrderTemplate';
import { IOrderIncludedLineItem } from '../../Interfaces/LineItems';
import { getCustomerForRecurrentOrder, getOrderData } from '../../request/haulingRequest';
export class RecurrentOrderTemplateController extends BaseController {
  async getRecurrentOrderTemplateGeneratedOrders(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const recurrentOrder = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplate')
      .from(RecurrentOrderTemplate, 'recurrentOrderTemplate')
      .leftJoinAndMapMany(
        'recurrentOrderTemplate.lineItems', // Row to map the information
        'RecurrentOrderTemplateLineItems', // Entity or table
        'lineItems', // Alias
        'recurrentOrderTemplate.id = lineItems.recurrentOrderTemplateId', //Condition
      )
      .where(`recurrentOrderTemplate.id = ${id}`)
      .getOne();

    if (!recurrentOrder) {
      throw ApiError.notFound(`Recurrent order with id ${id}`, `not found`);
    }

    if (recurrentOrder.csrEmail !== ctx.state.user.email) {
      throw ApiError.accessDenied('You can only view your own orders');
    }

    const orders = await dataSource
      .createQueryBuilder()
      .select('orders.*')
      .from(Orders, 'orders')
      .innerJoin(
        'RecurrentOrderTemplateOrder',
        'recurrentOrderTemplateOrder',
        'recurrentOrderTemplateOrder.orderId = orders.id',
      )
      .where(`recurrentOrderTemplateOrder.recurrentOrderTemplateId = ${id}`)
      .limit(25)
      .offset(0)
      .orderBy('orders.id', 'DESC')
      .getRawMany();

    const items: IRecurrentOrderTemplateGeneratedOrdersResponse[] = [];
    if (!isEmpty(orders)) {
      for (let index = 0; index < orders.length; index++) {
        const requestbody = {
          billableServiceId: orders[index].billable_service_id,
          businessUnitId: orders[index].business_unit_id,
          businessLineId: orders[index].business_line_id,
          materialId: orders[index].material_id,
          workOrderId: orders[index].work_order_id,
        };
        const requestResponse = await getOrderData(ctx, { data: requestbody });
        const tmp: IRecurrentOrderTemplateGeneratedOrdersResponse = {
          id: orders[index].id,
          workOrderId: orders[index].work_order_id,
          serviceDate: orders[index].service_date,
          status: orders[index].status,
          billableServiceId: orders[index].billable_service_id,
          grandTotal: orders[index].grand_total,
          materialId: orders[index].material_id,
          businessUnitId: orders[index].business_unit_id,
          businessLineId: orders[index].business_line_id,
          billableService: requestResponse.billableService,
          businessUnit: requestResponse.businessUnit,
          businessLine: requestResponse.businessLine,
          workOrder: requestResponse.workOrder,
          material: requestResponse.material,
        };
        items.push(tmp);
      }
    }

    ctx.body = items;
    ctx.status = 200;
    await dataSource.destroy();
    return next();
  }

  async getRecurrentOrderDetails(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const recurrentOrder: IRecurrentOrderTemplateGeneratedOrders | null = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplate')
      .from(RecurrentOrderTemplate, 'recurrentOrderTemplate')
      .leftJoinAndMapMany(
        'recurrentOrderTemplate.lineItems', // Row to map the information
        'RecurrentOrderTemplateLineItems', // Entity or table
        'lineItems', // Alias
        'recurrentOrderTemplate.id = lineItems.recurrentOrderTemplateId', //Condition
      )
      .where(`recurrentOrderTemplate.id = ${id}`)
      .getOne();

    if (!recurrentOrder) {
      ctx.body = undefined;
      ctx.status = 404;
      return next();
    }
    const requestbody = {
      businessLineId: recurrentOrder.businessLineId,
      jobSiteId: recurrentOrder.jobSiteId,
      customerId: recurrentOrder.customerId,
      billableServiceId: recurrentOrder.billableServiceId,
      materialId: recurrentOrder.materialId,
      equipmentItemId: recurrentOrder.equipmentItemId,
      serviceAreaId: recurrentOrder.serviceAreaId,
      businessUnitId: recurrentOrder.businessUnitId,
      purchaseOrderId: recurrentOrder.purchaseOrderId,
      orderContactId: recurrentOrder.orderContactId,
      jobSiteContactId: recurrentOrder.jobSiteContactId,
      customerJobSiteId: recurrentOrder.customerJobSiteId,
      permitId: recurrentOrder.permitId,
      globalRatesServicesId: recurrentOrder.globalRatesServicesId,
      customRatesGroupServicesId: recurrentOrder.customRatesGroupServicesId,
      customRatesGroupId: recurrentOrder.customRatesGroupId,
      disposalSiteId: recurrentOrder.disposalSiteId,
      materialProfileId: recurrentOrder.materialProfileId,
      projectId: recurrentOrder.projectId,
      thirdPartyHaulerId: recurrentOrder.thirdPartyHaulerId,
      promoId: recurrentOrder.promoId,
    };

    const requestResponse: IGeneralData = await getOrderData(ctx, { data: requestbody });

    const customer = await getCustomerForRecurrentOrder(ctx, {
      data: { customerId: requestbody.customerId },
    });

    const mergedResponse = {
      ...requestResponse,
      customer: {
        ...customer,
      },
    };

    Object.assign(recurrentOrder, mergedResponse);
    recurrentOrder.lineItems = await Promise.all(
      recurrentOrder.lineItems?.map(async (lineItem: IOrderIncludedLineItem) => {
        const requestbody2 = {
          billableLineItemId: lineItem.billableLineItemId,
          materialId: lineItem.materialId,
          globalRatesLineItemsId: lineItem.globalRatesLineItemsId,
        };
        const requestResponse2: IGeneralData = await getOrderData(ctx, { data: requestbody2 });
        lineItem.billableLineItem = requestResponse2.billableLineItem;
        lineItem.material = requestResponse2.material;
        lineItem.globalRatesLineItem = requestResponse2.globalRatesLineItem;
        return lineItem;
      }) ?? [],
    );
    if (isEmpty(recurrentOrder.lineItems)) {
      delete recurrentOrder.lineItems;
    }
    await dataSource.destroy();
    ctx.body = recurrentOrder;
    ctx.status = 200;
    return next();
  }

  async getDataForGeneration(ctx: Context, next: Next) {
    const recurrentOrderTemplateId: ObjectLiteral = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const recurrentOrder = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplate')
      .from(RecurrentOrderTemplate, 'recurrentOrderTemplate')
      .leftJoinAndMapMany(
        'recurrentOrderTemplate.lineItems', // Row to map the information
        'RecurrentOrderTemplateLineItems', // Entity or table
        'lineItems', // Alias
        'recurrentOrderTemplate.id = lineItems.recurrentOrderTemplateId', //Condition
      )
      .where('recurrentOrderTemplate.id = :id', recurrentOrderTemplateId)
      .getOne();

    await dataSource.destroy();

    if (recurrentOrder?.customerId) {
      const customer = await getCustomerForRecurrentOrder(ctx, {
        data: { customerId: recurrentOrder.customerId },
      });
      recurrentOrder.customerId = customer.id;
    }
    ctx.body = recurrentOrder;
    ctx.status = 200;
    return next();
  }

  async getRecurrentOrder(ctx: Context, next: Next) {
    const { limit, skip, sortBy, sortOrder, query } = ctx.request.query;
    const customerId = Number(ctx.request.query.customerId);
    const body: IBody = {};
    const where: IWhere = {};
    let sort: ISort = {};
    if (skip) {
      body.skip = +skip;
    }

    if (limit) {
      body.take = +limit;
    }
    if (sortBy) {
      const tmp = sortBy.toString();
      sort = { [tmp]: sortOrder ? sortOrder : 'ASC' };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    body.where = where;
    body.order = sort;
    ctx.request.body = body;
    const recurrentOrders: IRecurrentOrderFull[] = (await super.getDataBy(
      ctx,
      RecurrentOrderTemplate,
    )) as unknown as IRecurrentOrderFull[];

    let response: IRecurrentOrderFull[] = [];
    if (!isEmpty(recurrentOrders)) {
      for (let index = 0; index < recurrentOrders.length; index++) {
        const tmp = {
          callOnWayPhoneNumberId: recurrentOrders[index].callOnWayPhoneNumberId,
          textOnWayPhoneNumberId: recurrentOrders[index].textOnWayPhoneNumberId,
          purchaseOrderId: recurrentOrders[index].purchaseOrderId,
          id: recurrentOrders[index].id,
          startDate: recurrentOrders[index].startDate,
          endDate: recurrentOrders[index].endDate,
          nextServiceDate: recurrentOrders[index].nextServiceDate,
          status: recurrentOrders[index].status,
          paymentMethod: recurrentOrders[index].paymentMethod,
          grandTotal: recurrentOrders[index].grandTotal,
          createdAt: recurrentOrders[index].createdAt,
          updatedAt: recurrentOrders[index].updatedAt,
          frequencyPeriod: recurrentOrders[index].frequencyPeriod,
          frequencyType: recurrentOrders[index].frequencyType,
          customFrequencyType: recurrentOrders[index].customFrequencyType,
          frequencyDays: recurrentOrders[index].frequencyDays,
        };
        const requestbody = {
          businessLineId: recurrentOrders[index].businessLineId,
          jobSiteId: recurrentOrders[index].jobSiteId,
          customerId_Histo: recurrentOrders[index].customerId,
          billableServiceId: recurrentOrders[index].billableServiceId,
          materialId: recurrentOrders[index].materialId,
          equipmentItemId: recurrentOrders[index].equipmentItemId,
          serviceAreaId: recurrentOrders[index].serviceAreaId,
          businessUnitId: recurrentOrders[index].businessUnitId,
          purchaseOrderId: recurrentOrders[index].purchaseOrderId,
          orderContactId: recurrentOrders[index].orderContactId,
          jobSiteContactId: recurrentOrders[index].jobSiteContactId,
          customerJobSiteId: recurrentOrders[index].customerJobSiteId,
          permitId: recurrentOrders[index].permitId,
          disposalSiteId: recurrentOrders[index].disposalSiteId,
          materialProfileId: recurrentOrders[index].materialProfileId,
          projectId: recurrentOrders[index].projectId,
          thirdPartyHaulerId: recurrentOrders[index].thirdPartyHaulerId,
          promoId: recurrentOrders[index].promoId,
        };
        const requestResponse = await getOrderData(ctx, { data: requestbody });
        Object.assign(tmp, requestResponse);
        response.push(tmp as IRecurrentOrderFull);
      }
    }

    if (query) {
      response = response.filter(
        item =>
          item.jobSite.address.addressLine1.includes(query) ||
          item.jobSite.address.city.includes(query) ||
          item.jobSite.address.state.includes(query) ||
          item.jobSite.address.zip.includes(query) ||
          item.frequencyType.includes(query) ||
          item.status.includes(query) ||
          item.grandTotal.toString().includes(query),
      );
    }
    ctx.body = response;
    ctx.status = 200;
    return next();
  }

  async getRecurrentOrderTemplate(ctx: Context, next: Next) {
    return super.getAll(ctx, next, RecurrentOrderTemplate);
  }

  async getRecurrentOrderTemplateBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, RecurrentOrderTemplate);
  }

  async addRecurrentOrderTemplate(ctx: Context, next: Next) {
    return super.insert(ctx, next, RecurrentOrderTemplate, RecurrentOrderTemplateHistorical);
  }

  async updateRecurrentOrderTemplate(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    delete ctx.request.body.lineItems;
    return super.update(ctx, next, RecurrentOrderTemplate, RecurrentOrderTemplateHistorical, id);
  }

  async putRecurrentTemplateOnHold(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const status = { status: RECURRENT_TEMPLATE_STATUS.onHold };
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    dataSource.manager.update(RecurrentOrderTemplate, { id }, status);
    await dataSource.destroy();
    ctx.status = httpStatus.OK;
    return next();
  }

  async putRecurrentTemplateOffHold(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const status = { status: RECURRENT_TEMPLATE_STATUS.active };
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    dataSource.manager.update(RecurrentOrderTemplate, { id }, status);
    await dataSource.destroy();
    ctx.status = httpStatus.OK;
    return next();
  }

  async closeRecurrentOrderTemplate(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const status = { status: RECURRENT_TEMPLATE_STATUS.closed };
    const recurrentOrderTemplateId: ObjectLiteral = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const recurrentOrder = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplateOrder')
      .from(RecurrentOrderTemplateOrder, 'recurrentOrderTemplateOrder')
      .innerJoin('Orders', 'orders', 'orders.id = recurrentOrderTemplateOrder.orderId')
      .where('recurrentOrderTemplateOrder.recurrentOrderTemplateId = :id', recurrentOrderTemplateId)
      .andWhere('orders.status IN (:...status)', {
        status: [ORDER_STATUS.inProgress, ORDER_STATUS.completed, ORDER_STATUS.approved],
      })
      .getCount();

    if (recurrentOrder > 0) {
      throw ApiError.invalidRequest(
        'There are not finalized orders created for the recurrent order.',
        'Please finalize or cancel them',
      );
    }

    dataSource.manager.update(RecurrentOrderTemplate, { id }, status);
    await dataSource.destroy();
    ctx.status = httpStatus.OK;
    return next();
  }

  async deleteRecurrentOrderTemplate(ctx: Context, next: Next) {
    return super.delete(ctx, next, RecurrentOrderTemplate, RecurrentOrderTemplateHistorical);
  }

  async getCount(ctx: Context, next: Next) {
    const { customerId } = ctx.request.query;

    const response = { total: 0 };
    let id: number = 0;
    if (customerId) {
      id = +customerId;
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const countRecurrentOrders = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplate')
      .from(RecurrentOrderTemplate, 'recurrentOrderTemplate')
      .where(`recurrentOrderTemplate.customerId = ${id}`)
      .groupBy('recurrentOrderTemplate.id')
      .getCount();
    await dataSource.destroy();
    response.total = countRecurrentOrders;

    ctx.body = response;
    ctx.status = 200;
    return next();
  }
}
