import { In, DataSource, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { Next } from 'koa';
import { isEmpty } from 'lodash';
import {
  QueryDeepPartialEntity,
  QueryPartialEntity,
} from 'typeorm/query-builder/QueryPartialEntity';
import { Orders } from '../../database/entities/tenant/Orders';
import { BaseController } from '../base.controller';
import { SurchargeItem } from '../../database/entities/tenant/SurchargeItem';
import { OrderTaxDistrict } from '../../database/entities/tenant/OrderTaxDistrict';
import httpStatus from '../../consts/httpStatusCodes';
import { OrdersHistorical } from '../../database/entities/tenant/OrdersHistorical';
import {
  calcRates,
  calculateSurcharges,
  getOrderSurchargeHistoricalIds,
} from '../../utils/calclSurcharges';
import { Context } from '../../Interfaces/Auth';
import { IBody, IWhere } from '../../Interfaces/GeneralsFilter';
import {
  IGetCountResponse,
  IOrderCount,
  IOrderExtends,
  IOrdersSelect,
  IOrderTemplate,
  IUpdateOrders,
} from '../../Interfaces/Orders';
import { IGeneralData, IRequesParamsGeneral } from '../../Interfaces/GeneralData';
import { IOrderSurchargeHistorical } from '../../Interfaces/OrderSurcharge';
import { getOrdersFilter } from '../../utils/getOrdersFilter';
import { ICalcRates, ISurchargeItem } from '../../Interfaces/SurchargeItem';
import { IBillableSurcharge } from '../../Interfaces/BillableSurcharge';
import { getOrderData, getBillableSurcharges } from './../../request/haulingRequest';
import { ThresholdItems } from './../../database/entities/tenant/ThresholdItems';
import { LineItems } from './../../database/entities/tenant/LineItems';

const bodyselected = [
  'billableLineItemId',
  'billableServiceId',
  'globalRatesSurchargesId',
  'customRatesGroupSurchargesId',
  'amount',
  'materialId',
  'surchargeId',
];

const dataChangeStatus = (ctx: Context, status: string) => {
  const { disposalSiteId } = ctx.request.body;
  const newData = { status, disposalSiteId: undefined };
  if (disposalSiteId) {
    newData.disposalSiteId = disposalSiteId;
  }
  return newData;
};
export class OrdersController extends BaseController {
  async getOrdersByOrderTemplate(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const idOrderTemplate: ObjectLiteral = ctx.request.body;
    const recurrentOrder = await dataSource
      .createQueryBuilder()
      .select('orders.*')
      .from(Orders, 'orders')
      .innerJoin(
        'RecurrentOrderTemplateOrder',
        'recurrentOrderTemplateOrder',
        'recurrentOrderTemplateOrder.orderId = orders.id',
      )
      .where('recurrentOrderTemplateOrder.recurrentOrderTemplateId = :id', idOrderTemplate)
      .limit(25)
      .offset(0)
      .orderBy('orders.id', 'DESC')
      .getRawMany();
    const response: IOrderTemplate[] = [];
    if (!isEmpty(recurrentOrder)) {
      for (let index = 0; index < recurrentOrder.length; index++) {
        const tmp = {
          id: recurrentOrder[index].id,
          workOrderId: recurrentOrder[index].work_order_id,
          serviceDate: recurrentOrder[index].service_date,
          status: recurrentOrder[index].status,
          billableServiceId: recurrentOrder[index].billable_service_id,
          grandTotal: recurrentOrder[index].grand_total,
          materialId: recurrentOrder[index].material_id,
          businessUnitId: recurrentOrder[index].business_unit_id,
          businessLineId: recurrentOrder[index].business_line_id,
        };
        response.push(tmp);
      }
    }
    ctx.body = response;
    ctx.status = 200;
    await dataSource.destroy();
    return next();
  }

  async getOrdersSelect(ctx: Context, next: Next) {
    const { condition, fields } = ctx.request.body;
    const body: IBody = {};
    const where: IWhere = {};
    let sendLineItems: boolean = false;
    let sendThresholds: boolean = false;
    let sendTaxDistricts: boolean = false;
    if (fields) {
      if (fields.indexOf('lineItems') != -1) {
        fields.splice(fields.indexOf('lineItems', 0), 1);
        sendLineItems = true;
      }
      if (fields.indexOf('thresholds') != -1) {
        fields.splice(fields.indexOf('thresholds', 0), 1);
        sendThresholds = true;
      }
      if (fields.indexOf('taxDistricts') != -1) {
        fields.splice(fields.indexOf('taxDistricts', 0), 1);
        sendTaxDistricts = true;
      }
      fields.push('billableServicePrice');
      fields.push('billableServiceTotal');
      fields.push('billableLineItemsTotal');
      fields.push('initialGrandTotal');
      fields.push('surchargesTotal');
      fields.push('thresholdsTotal');
      fields.push('beforeTaxesTotal');
      fields.push('grandTotal');
      body.select = fields;
    }
    if (condition) {
      if (condition.id) {
        where.id = condition.id;
      }
    }
    body.where = where;
    ctx.request.body = body;
    const orders = (await super.getDataBy(ctx, Orders)) as QueryPartialEntity<IOrdersSelect>[];
    const order = orders[0];
    if (sendLineItems) {
      ctx.request.body = { where: { orderId: order.id } };
      order.lineItems = (await super.getDataBy(ctx, LineItems)) as QueryPartialEntity<LineItems>[];
    }
    if (sendThresholds) {
      ctx.request.body = { where: { orderId: order.id } };
      order.thresholds = (await super.getDataBy(
        ctx,
        ThresholdItems,
      )) as QueryPartialEntity<ThresholdItems>[];
    }
    if (sendTaxDistricts) {
      ctx.request.body = { where: { orderId: order.id } };
      order.taxDistricts = [];
      const orderTaxDistrict = (await super.getDataBy(
        ctx,
        OrderTaxDistrict,
      )) as QueryPartialEntity<OrderTaxDistrict>[];
      if (orderTaxDistrict.length > 0) {
        for (let index = 0; index < orderTaxDistrict.length; index++) {
          const requestbody = {
            taxDistrictId: orderTaxDistrict[index].taxDistrictId as number,
          };
          const requestResponse = await getOrderData(ctx, { data: requestbody });
          if (requestResponse.taxDistricts?.[0]) {
            order.taxDistricts.push(requestResponse.taxDistricts[0]);
          }
        }
      }
    }
    ctx.body = order;
    ctx.status = 200;
    return next();
  }

  async getOrders(ctx: Context, next: Next, history: Boolean = false) {
    const { query } = ctx.request.query;
    const { sort, where, body, getmoreInfo } = await getOrdersFilter(ctx, history);
    body.where = where;
    body.order = sort;
    ctx.request.body = body;
    let orders: IOrderExtends[] = [];
    if (history === true) {
      orders = (await super.getDataBy(ctx, OrdersHistorical)) as unknown as IOrderExtends[];
    } else {
      orders = (await super.getDataBy(ctx, Orders)) as unknown as IOrderExtends[];
    }
    let response: IOrderExtends[] = [];
    const promisesArray: Promise<void>[] = [];
    const getData = (index: number, tmp: IOrderExtends, taxIds: number[]) =>
      new Promise<void>(async res => {
        const requestbody: IRequesParamsGeneral = {
          businessLineId: tmp.businessLineId,
          workOrderId: tmp.workOrderId,
          jobSiteId: tmp.jobSiteId,
          isRollOff: tmp.isRollOff,
          customerId: tmp.customerId,
          billableServiceId: tmp.billableServiceId,
          materialId: tmp.materialId,
          equipmentItemId: tmp.equipmentItemId,
          serviceAreaId: tmp.serviceAreaId,
          businessUnitId: tmp.businessUnitId,
          purchaseOrderId: tmp.purchaseOrderId,
          taxDistricts: taxIds,
          permitId: tmp.permitId,
          customRatesGroupId: tmp.customRatesGroupId,
          customRatesGroupServicesId: tmp.customRatesGroupServicesId,
          orderContactIdHisto: tmp.orderContactId,
          jobSiteContactIdHisto: tmp.jobSiteContactId,
          customerJobSiteId: tmp.customerJobSiteId,
          disposalSiteId: tmp.disposalSiteId,
          thirdPartyHaulerId: tmp.thirdPartyHaulerId,
          promoId: tmp.promoId,
          projectId: tmp.projectId,
          landfillOperationId: tmp.id,
        };
        const requestResponse = await getOrderData(ctx, { data: requestbody });
        Object.assign(response[index], requestResponse);
        return res();
      });
    const getDataThreshold = (index: number, indexThreshold: number, tmp: ThresholdItems) =>
      new Promise<void>(async res => {
        const requestThreshold = {
          thresholdId: tmp.thresholdId,
          globalRatesThresholdsId: tmp.globalRatesThresholdsId,
          customRatesGroupThresholdsId: tmp.customRatesGroupThresholdsId,
        };
        const responseThreshold: IGeneralData = await getOrderData(ctx, {
          data: requestThreshold,
        });
        Object.assign(response[index].thresholds?.[indexThreshold] ?? {}, responseThreshold);

        return res();
      });
    if (!isEmpty(orders)) {
      for (let index = 0; index < orders.length; index++) {
        ctx.request.body = { where: { orderId: orders[index].id } };
        const orderTax = (await super.getDataBy(
          ctx,
          OrderTaxDistrict,
        )) as QueryPartialEntity<OrderTaxDistrict>[];
        const taxIds: number[] = [];
        orderTax.forEach(element => {
          taxIds.push(element.taxDistrictId as number);
        });

        const tmp: IOrderExtends = orders[index];

        ctx.request.body.select = bodyselected;
        const surcharge = (await super.getDataBy(
          ctx,
          SurchargeItem,
        )) as unknown as ISurchargeItem[];
        delete ctx.request.body.select;
        if (!isEmpty(surcharge) && getmoreInfo === true) {
          const surchargeNew: ISurchargeItem[] = [];
          for (const element of surcharge) {
            const item: ISurchargeItem = element;
            item.price = item.amount;
            delete item.amount;
            const requestSurcharge: IRequesParamsGeneral = {
              billableServiceId: item.billableServiceId,
              materialId: item.materialId,
              surchargeId: item.surchargeId,
              globalRatesSurchargesId: item.globalRatesSurchargesId,
              customRatesGroupSurchargesId: item.customRatesGroupSurchargesId,
            };
            const responseSurcharge = await getOrderData(ctx, {
              data: requestSurcharge,
            });
            Object.assign(item, responseSurcharge);
            surchargeNew.push(item);
          }
          tmp.surcharges = surchargeNew;
        }

        const lineItem = (await super.getDataBy(ctx, LineItems)) as QueryPartialEntity<LineItems>[];
        if (lineItem.length > 0) {
          const lineItemNew: QueryPartialEntity<LineItems>[] = [];
          for (const element of lineItem) {
            const item = element as LineItems;
            const requestLineItem: IRequesParamsGeneral = {
              materialId_Histo: item.materialId,
              billableLineItemId: item.billableLineItemId,
              customRatesGroupLineItemsId: item.customRatesGroupLineItemsId,
              globalRatesLineItemsId: item.globalRatesLineItemsId,
            };
            const responseLineItem = await getOrderData(ctx, {
              data: requestLineItem,
            });
            Object.assign(item, responseLineItem);
            lineItemNew.push(item);
          }
          tmp.lineItems = lineItemNew;
        }

        const thresholds = (await super.getDataBy(
          ctx,
          ThresholdItems,
        )) as QueryPartialEntity<ThresholdItems>[];
        if (thresholds.length > 0 && getmoreInfo === true) {
          const thresholdsNew: QueryPartialEntity<ThresholdItems>[] = [];
          for (let index2 = 0; index2 < thresholds.length; index2++) {
            const item: QueryPartialEntity<ThresholdItems> = thresholds[index2];
            thresholdsNew.push(item);
            promisesArray.push(getDataThreshold(index, index2, item as ThresholdItems));
          }
          tmp.thresholds = thresholdsNew;
        }

        promisesArray.push(getData(index, tmp, taxIds));

        response.push(tmp);
      }
    }
    await Promise.all(promisesArray);
    if (query) {
      response = response.filter(
        item =>
          item.id.toString().includes(query) ||
          item.workOrderId.toString().includes(query) ||
          item.businessLine.name.includes(query) ||
          item.jobSite.address.addressLine1.includes(query) ||
          item.billableService.description.includes(query) ||
          item.customer.businessName.includes(query) ||
          item.customer.name.toLowerCase().includes(query) ||
          item.grandTotal.toString().includes(query),
      );
    }

    ctx.body = response;
    ctx.status = httpStatus.OK;
    return next();
  }

  async getOrderHistorical(ctx: Context, next: Next) {
    return new OrdersController().getOrders(ctx, next, true);
  }

  async getOrdersBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, Orders);
  }

  async addOrders(ctx: Context, next: Next) {
    if (!ctx.request.body.originalCustomerId) {
      ctx.request.body.originalCustomerId = ctx.request.body.customerId;
    }

    return super.insert(ctx, next, Orders, OrdersHistorical);
  }

  async approveOrder(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.findOneBy(Orders, { id });
    if (!data || data.status !== 'completed') {
      ctx.body = undefined;
      ctx.status = 404;
      await dataSource.destroy();
      return next();
    }
    ctx.request.body = dataChangeStatus(ctx, 'approved');
    return super.update(ctx, next, Orders, OrdersHistorical, id);
  }

  async unfinalizedOrder(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const { comment } = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.findOneBy(Orders, { id });
    if (!data || data.status !== 'finalized') {
      ctx.body = undefined;
      ctx.status = 404;
      return next();
    }
    ctx.request.body = { status: 'approved', unfinalizedComment: comment };
    await dataSource.destroy();
    return super.update(ctx, next, Orders, OrdersHistorical, id);
  }

  async invoicedOrders(ctx: Context, next: Next) {
    const { businessUnitId, customerId, customers } = ctx.request.body;
    const filters: IWhere = { status: In(['finalized', 'canceled']), businessUnitId };
    if (customers && !customerId) {
      filters.customerId = In[customers];
    }
    if (customerId && !customers) {
      filters.customerId = customerId;
    }
    ctx.request.body.where = filters;
    return super.getBy(ctx, next, Orders);
  }

  async unapproveOrder(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const { comment } = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.findOneBy(Orders, { id });
    if (!data || data.status !== 'approved') {
      ctx.body = undefined;
      ctx.status = 404;
      return next();
    }
    ctx.request.body = { status: 'completed', unapprovedComment: comment };
    await dataSource.destroy();
    return super.update(ctx, next, Orders, OrdersHistorical, id);
  }

  async bulkApproveOrder(ctx: Context, next: Next) {
    const { updatedAt, businessUnitId } = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.update(
      Orders,
      { businessUnitId, status: 'completed' },
      { status: 'approved', updatedAt },
    );

    ctx.status = httpStatus.OK;
    await dataSource.destroy();
    return next();
  }

  async finalizedOrder(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.findOneBy(Orders, { id });
    if (!data || data.status !== 'approved') {
      ctx.body = undefined;
      ctx.status = 404;
      return next();
    }
    ctx.request.body = dataChangeStatus(ctx, 'finalized');
    await dataSource.destroy();
    return super.update(ctx, next, Orders, OrdersHistorical, id);
  }

  async bulkFinalizedOrder(ctx: Context, next: Next) {
    const { businessUnitId } = ctx.request.body;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    await dataSource.manager.update(
      Orders,
      { businessUnitId, status: 'approved' },
      { status: 'finalized' },
    );

    ctx.status = httpStatus.OK;
    await dataSource.destroy();
    return next();
  }

  async updateOrdersCascade(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    const { order } = ctx.request.body;
    delete order.billableServicePriceToDisplay;
    delete order.billableServiceTotalToDisplay;
    delete order.billableLineItemsTotalToDisplay;
    delete order.thresholdsTotalToDisplay;
    delete order.surchargesTotalToDisplay;
    delete order.beforeTaxesTotalToDisplay;
    delete order.onAccountTotalToDisplay;
    delete order.initialGrandTotalToDisplay;
    delete order.grandTotalToDisplay;

    if (!isEmpty(ctx.request.body.lineItem)) {
      const { lineItem } = ctx.request.body;
      for (const element of lineItem) {
        const item = element;
        const lineId = { ...item };

        delete item.globalRatesSurcharges;
        delete item.surcharge;
        delete item.id;
        delete item.priceToDisplay;
        delete item.billableLineItem;
        delete item.globalRatesLineItem;
        delete item.material;

        item.orderId = id;
        ctx.request.body = item;
        if (lineId.id) {
          super.updateVoid(ctx, LineItems, undefined, lineId.id as number);
        } else {
          super.insertVoid(ctx, LineItems);
        }
      }
    }
    ctx.request.body = order;
    return super.update(ctx, next, Orders, OrdersHistorical, id);
  }

  async updateOrders(ctx: Context, next: Next) {
    const lineItems = ctx.request.body.lineItems;
    const id: number = +ctx.url.split('/')[4];
    delete ctx.request.body.lineItems;
    let finalOrderSurcharges: IOrderSurchargeHistorical[] = [];

    const {
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      applySurcharges,
      billableServicePrice,
    } = ctx.request.body as IUpdateOrders;

    if (applySurcharges) {
      const type = customRatesGroupId ? 'custom' : 'global';
      const rates = await calcRates({
        ctx,
        businessUnitId,
        businessLineId,
        customRatesGroupId,
        type,
      } as ICalcRates);

      const customRates = rates.customRates;
      const globalRates = rates.globalRates;

      const surcharges: IBillableSurcharge[] = await getBillableSurcharges(ctx, {
        data: { active: true, businessLineId },
      });

      const material = ctx.request.body.materialId;
      const billableService = ctx.request.body.billableServiceId;

      const requestResponse = await getOrderData(ctx, {
        data: { materialId: material, billableServiceId: billableService },
      });
      const materialId = requestResponse.material?.originalId;
      const billableServiceId = requestResponse.billableService?.originalId;
      const billableServiceApplySurcharges = requestResponse.billableService?.applySurcharges;

      const calclSurcharges = calculateSurcharges({
        globalRatesSurcharges: globalRates?.globalRatesSurcharges,
        customRatesSurcharges: customRates?.customRatesSurcharges,
        materialId,
        billableServiceId,
        billableServicePrice,
        billableServiceApplySurcharges,
        lineItems,
        surcharges,
      });
      const orderSurcharges = calclSurcharges.orderSurcharges;
      finalOrderSurcharges = await getOrderSurchargeHistoricalIds(ctx, orderSurcharges, id);
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    if (!isEmpty(lineItems)) {
      await dataSource.manager.delete(LineItems, {
        orderId: id,
      });
      for (let i = 0; i < lineItems.length; i++) {
        const request = {
          billableLineItemIdHisto: lineItems[i].billableLineItemId,
        };
        const { billableLineItem } = await getOrderData(ctx, {
          data: request,
        });
        const newLineItem: LineItems = {
          ...lineItems[i],
          orderId: id,
          billableLineItemId: billableLineItem?.id,
        };
        await dataSource.manager.insert(LineItems, newLineItem);
      }
    }
    await dataSource.manager.delete(SurchargeItem, {
      orderId: id,
    });
    if (!isEmpty(finalOrderSurcharges)) {
      for (const element of finalOrderSurcharges) {
        await dataSource.manager.insert(
          SurchargeItem,
          element as QueryDeepPartialEntity<SurchargeItem>,
        );
      }
    }
    await dataSource.destroy();
    return super.update(ctx, next, Orders, OrdersHistorical, id);
  }

  async deleteOrders(ctx: Context, next: Next) {
    return super.delete(ctx, next, Orders, OrdersHistorical);
  }

  async deleteCascadeOrders(ctx: Context, next: Next) {
    const id: string = ctx.url.split('/')[4];
    ctx.query.id = id;
    return super.delete(ctx, next, Orders, OrdersHistorical);
  }

  async getCount(ctx: Context) {
    const { email } = ctx.state.user;
    const { mine, finalizedOnly, customerId, businessUnitId } = ctx.request.query;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    let qb: SelectQueryBuilder<Orders> = dataSource
      .createQueryBuilder()
      .select('orders.status as status')
      .addSelect('COUNT(orders.status) as counter')
      .from(Orders, 'orders');
    if (businessUnitId) {
      qb = qb.where(`orders.business_unit_id=${businessUnitId}`);
    }

    if (mine) {
      qb = qb.andWhere(`orders.csr_email='${email}'`);
    }

    if (customerId) {
      qb = qb.andWhere({ customerId });
    }
    qb = qb.groupBy('status');
    const statuses = {
      inProgress: 0,
      completed: 0,
      approved: 0,
      finalized: 0,
      canceled: 0,
      invoiced: 0,
    };
    const response: IGetCountResponse = { total: 0, filteredTotal: 0 };
    const responseDB: IOrderCount[] = await qb.execute();

    let totalOrder = 0;
    for (let index = 0; index < responseDB.length; index++) {
      totalOrder += +responseDB[index].counter;
      if (responseDB[index].status === 'inProgress') {
        statuses.inProgress = +responseDB[index].counter;
      } else if (responseDB[index].status === 'completed') {
        statuses.completed = +responseDB[index].counter;
      } else if (responseDB[index].status === 'approved') {
        statuses.approved = +responseDB[index].counter;
      } else if (responseDB[index].status === 'finalized') {
        statuses.finalized = +responseDB[index].counter;
      } else if (responseDB[index].status === 'canceled') {
        statuses.canceled = +responseDB[index].counter;
      } else if (responseDB[index].status === 'invoiced') {
        statuses.invoiced = +responseDB[index].counter;
      }
    }
    if (finalizedOnly === 'false' && statuses.canceled) {
      statuses.finalized += statuses.canceled;
      statuses.canceled = 0;
    }

    response.total = totalOrder;
    response.filteredTotal = totalOrder;
    response.statuses = statuses;

    ctx.body = response;
    ctx.status = 200;
  }

  async updateByIdOrderState(ctx: Context, next: Next) {
    const { ids, ...input } = ctx.request.body;
    if (!ids) {
      ctx.status = httpStatus.BAD_REQUEST;
      return next();
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.update(
      Orders,
      { id: In(ids as number[]) },
      input as QueryDeepPartialEntity<Orders>,
    );
    const data = await dataSource.manager.findBy(Orders, { id: In(ids as number[]) });
    ctx.body = data;
    ctx.status = httpStatus.OK;
    for await (const item of data) {
      const historical = {
        ...data,
        ...BaseController.historicalAttributes('edited', item.id, ctx),
      };
      await dataSource.manager.insert(OrdersHistorical, historical);
    }
    await dataSource.destroy();
    return next();
  }
}
