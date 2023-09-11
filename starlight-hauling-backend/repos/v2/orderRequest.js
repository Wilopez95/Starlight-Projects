import compose from 'lodash/fp/compose.js';

import BaseRepository from '../_base.js';
import BillableServiceRepo from '../billableService.js';
import MaterialRepo from '../material.js';
import EquipmentItemRepo from '../equipmentItem.js';
import ContractorRepo from '../contractor.js';
import ContactRepo from '../contact.js';
import CustomerRepo from '../customer.js';
import JobSiteRepo from '../jobSite.js';
import NotificationRepo from '../notification.js';
import PurchaseOrderRepo from '../purchaseOrder.js';

import { unambiguousCondition } from '../../utils/dbHelpers.js';

import { ORDER_REQUEST_STATUS } from '../../consts/orderRequestStatuses.js';
import { NOTIFICATION_TYPE, NOTIFICATION_TITLE } from '../../consts/notifications.js';
import { SORT_ORDER } from '../../consts/sortOrders.js';
import { ORDER_REQUEST_SORTING_ATTRIBUTE } from '../../consts/orderRequestSortingAttributes.js';
import OrderRepository from './order.js';

const TABLE_NAME = 'order_requests';

class OrderRequestRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOne({ data, fields = ['*'] }) {
    const trx = await this.knex.transaction();

    try {
      await this.proceedPurchaseOrder(data, trx);

      const { purchaseOrder, ...dataToInsert } = data;

      const result = await super.createOne(
        {
          data: dataToInsert,
          fields,
        },
        trx,
      );

      await trx.commit();

      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updateOne({ condition: { id: orderRequestId }, data, fields = ['*'] }) {
    const trx = await this.knex.transaction();

    try {
      await this.proceedPurchaseOrder(data, trx);

      const { purchaseOrder, ...dataToUpdate } = data;

      await super.updateBy({
        condition: { id: orderRequestId },
        data: dataToUpdate,
        fields,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getAllPaginatedRequests(
    { condition, fields = ['*'], skip = 0, limit = 100 } = {},
    trx = this.knex,
  ) {
    const selects = fields.map(field => `${this.tableName}.${field}`);

    selects.push(
      trx.raw('to_json(??.*) as ??', [CustomerRepo.TABLE_NAME, 'customer']),
      trx.raw('to_json(??.*) as ??', [BillableServiceRepo.TABLE_NAME, 'billableService']),
      trx.raw('to_json(??.*) as ??', [MaterialRepo.TABLE_NAME, 'material']),
      trx.raw('to_json(??.*) as ??', [EquipmentItemRepo.TABLE_NAME, 'equipmentItem']),
      trx.raw('to_json(??.*) as ??', [JobSiteRepo.TABLE_NAME, 'jobSite2']),
      trx.raw('to_json(??.*) as ??', [PurchaseOrderRepo.TABLE_NAME, 'purchaseOrder']),
    );

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${this.tableName}.customerId`,
      )
      .leftJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billableServiceId`,
      )
      .leftJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      )
      .leftJoin(
        EquipmentItemRepo.TABLE_NAME,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.equipmentItemId`,
      )
      .leftJoin(
        JobSiteRepo.TABLE_NAME,
        `${JobSiteRepo.TABLE_NAME}.id`,
        `${this.tableName}.jobSite2Id`,
      )
      .leftJoin(
        PurchaseOrderRepo.TABLE_NAME,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
        `${this.tableName}.purchaseOrderId`,
      )
      .andWhere(unambiguousCondition(this.tableName, condition))
      .offset(skip)
      .limit(limit)
      .groupBy([
        `${this.tableName}.id`,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${JobSiteRepo.TABLE_NAME}.id`,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
      ])
      .orderBy(`${this.tableName}.id`, 'desc');

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  getOrderRequestQuery(
    {
      condition,
      fields,
      skip,
      limit,
      sortBy = ORDER_REQUEST_SORTING_ATTRIBUTE.id,
      sortOrder = SORT_ORDER.desc,
    },
    trx,
  ) {
    const sortField = this.orderRequestsSortField(sortBy);

    const selects = fields.map(field => `${this.tableName}.${field}`);
    selects.push(
      trx.raw('to_json(??.*) as ??', [ContractorRepo.TABLE_NAME, 'contractor']),
      trx.raw('to_json(??.*) as ??', [ContactRepo.TABLE_NAME, 'contractorContact']),
      trx.raw('to_json(??.*) as ??', [CustomerRepo.TABLE_NAME, 'customer']),
      trx.raw('to_json(??.*) as ??', [JobSiteRepo.TABLE_NAME, 'jobSite']),
      trx.raw('to_json(??.*) as ??', [BillableServiceRepo.TABLE_NAME, 'billableService']),
      trx.raw('to_json(??.*) as ??', [MaterialRepo.TABLE_NAME, 'material']),
      trx.raw('to_json(??.*) as ??', [EquipmentItemRepo.TABLE_NAME, 'equipmentItem']),
      trx.raw('to_json(??.*) as ??', [PurchaseOrderRepo.TABLE_NAME, 'purchaseOrder']),
    );

    return trx(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(
        ContractorRepo.TABLE_NAME,
        `${ContractorRepo.TABLE_NAME}.id`,
        `${this.tableName}.contractorId`,
      )
      .leftJoin(
        ContactRepo.TABLE_NAME,
        `${ContactRepo.TABLE_NAME}.id`,
        `${ContractorRepo.TABLE_NAME}.contactId`,
      )
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${this.tableName}.customerId`,
      )
      .innerJoin(
        JobSiteRepo.TABLE_NAME,
        `${JobSiteRepo.TABLE_NAME}.id`,
        `${this.tableName}.jobSiteId`,
      )
      .innerJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billableServiceId`,
      )
      .innerJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      )
      .innerJoin(
        EquipmentItemRepo.TABLE_NAME,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.equipmentItemId`,
      )
      .leftJoin(
        PurchaseOrderRepo.TABLE_NAME,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
        `${this.tableName}.purchaseOrderId`,
      )
      .where(condition)
      .select(selects)
      .offset(skip)
      .limit(limit)
      .groupBy([
        `${this.tableName}.id`,
        `${ContractorRepo.TABLE_NAME}.id`,
        `${ContactRepo.TABLE_NAME}.id`,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${JobSiteRepo.TABLE_NAME}.id`,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
      ])
      .orderBy(sortField, sortOrder);
  }

  async getPopulatedById({ id, fields = ['*'] } = {}, trx = this.knex) {
    const item = await this.getOrderRequestQuery(
      { condition: { [`${this.tableName}.id`]: id }, fields, skip: 0, limit: 1 },
      trx,
    );

    return item?.[0] ? this.mapFields(item[0]) : null;
  }

  async getAllPaginated(
    {
      condition: { businessUnitId, status },
      skip = 0,
      limit = 25,
      sortBy,
      sortOrder,
      fields = ['*'],
    } = {},
    trx = this.knex,
  ) {
    const items = await this.getOrderRequestQuery(
      {
        condition: {
          [`${this.tableName}.status`]: status,
          [`${CustomerRepo.TABLE_NAME}.businessUnitId`]: businessUnitId,
        },
        fields,
        skip,
        limit,
        sortBy,
        sortOrder,
      },
      trx,
    );

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async countBy({ condition: { businessUnitId, status } } = {}, trx = this.knex) {
    const condition = {};
    if (businessUnitId) {
      condition[`${ContractorRepo.TABLE_NAME}.businessUnitId`] = businessUnitId;
    }
    if (status) {
      condition[`${this.tableName}.status`] = status;
    }

    const [result] = await trx(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(
        ContractorRepo.TABLE_NAME,
        `${ContractorRepo.TABLE_NAME}.id`,
        `${this.tableName}.contractorId`,
      )
      .where(condition)
      .count(`${this.tableName}.id`);

    return Number(result?.count) || 0;
  }

  async getAllByIdPopulated({ condition: { id }, fields = ['*'] } = {}, trx = this.knex) {
    const selects = fields.map(field => `${this.tableName}.${field}`);

    selects.push(
      trx.raw('to_json(??.*) as ??', [BillableServiceRepo.TABLE_NAME, 'billableService']),
      trx.raw('to_json(??.*) as ??', [MaterialRepo.TABLE_NAME, 'material']),
      trx.raw('to_json(??.*) as ??', [EquipmentItemRepo.TABLE_NAME, 'equipmentItem']),
      trx.raw('to_json(??.*) as ??', [JobSiteRepo.TABLE_NAME, 'jobSite']),
    );

    const item = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billableServiceId`,
      )
      .innerJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      )
      .innerJoin(
        EquipmentItemRepo.TABLE_NAME,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.equipmentItemId`,
      )
      .innerJoin(
        JobSiteRepo.TABLE_NAME,
        `${JobSiteRepo.TABLE_NAME}.id`,
        `${this.tableName}.jobSiteId`,
      )
      .andWhere(`${this.tableName}.id`, id)
      .select(selects)
      .orderBy(`${this.tableName}.id`)
      .groupBy([
        `${this.tableName}.id`,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${JobSiteRepo.TABLE_NAME}.id`,
      ])
      .first();

    return item ? this.mapFields(item) : null;
  }

  async markAsConfirmed(orderRequestId, orderId, trx = this.knex) {
    const { contractorId } = await super.updateBy(
      {
        condition: { id: orderRequestId },
        data: { status: ORDER_REQUEST_STATUS.confirmed },
        fields: ['contractorId'],
      },
      trx,
    );

    const repo = NotificationRepo.getInstance(this.ctxState);
    const body = await repo.getOrderRequestConfirmedMsgBody(orderId, trx);

    await repo.createOne(
      {
        data: {
          contractorId,
          orderRequestId,
          type: NOTIFICATION_TYPE.salesOrder,
          title: NOTIFICATION_TITLE.orderRequestConfirmed,
          time: new Date(),
          body,
        },
        fields: [],
      },
      trx,
    );
  }

  async markAsHistory({ orderIds = [] }, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      const repo = NotificationRepo.getInstance(this.ctxState);

      if (orderIds?.length) {
        const ordersTn = OrderRepository.TABLE_NAME;
        const orders = await _trx(ordersTn)
          .withSchema(this.schemaName)
          .whereIn(`${ordersTn}.id`, orderIds)
          .whereNotNull(`${ordersTn}.orderRequestId`)
          .leftJoin(this.tableName, `${ordersTn}.orderRequestId`, `${this.tableName}.id`)
          .select([
            `${ordersTn}.orderRequestId`,
            `${ordersTn}.id`,
            `${this.tableName}.contractor_id as contractorId`,
          ]);

        const orIds = orders?.map(({ orderRequestId }) => orderRequestId);

        if (orIds?.length) {
          await _trx(this.tableName)
            .withSchema(this.schemaName)
            .whereIn('id', orIds)
            .update({ status: ORDER_REQUEST_STATUS.history }, ['id']);
        }

        if (orders?.length) {
          const msgBodies = await Promise.all(
            orders.map(({ id }) => repo.getOrderInvoicedMsgBody(id, _trx)),
          );

          await repo.insertMany(
            {
              data: orders.map(({ id, contractorId }, i) => ({
                contractorId,
                orderRequestId: id, // salesorderid
                type: NOTIFICATION_TYPE.salesOrder,
                title: NOTIFICATION_TITLE.orderInvoiced,
                time: new Date(),
                body: msgBodies[i],
              })),
            },
            _trx,
          );
        }
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async markAsRejected(id, trx = this.knex) {
    const { contractorId } = await super.updateBy(
      {
        condition: { id },
        data: { status: ORDER_REQUEST_STATUS.rejected },
        fields: ['contractorId'],
      },
      trx,
    );

    const repo = NotificationRepo.getInstance(this.ctxState);
    const body = await repo.getOrderRequestCanceledMsgBody(id, trx);

    await repo.createOne(
      {
        data: {
          contractorId,
          orderRequestId: id,
          type: NOTIFICATION_TYPE.orderRequest,
          title: NOTIFICATION_TITLE.orderRequestCanceled,
          time: new Date(),
          body,
        },
        fields: [],
      },
      trx,
    );
  }

  async proceedPurchaseOrder(data, trx) {
    data.purchaseOrderId = null;

    const { purchaseOrder, customerId } = data;

    if (purchaseOrder && customerId) {
      const { id } = await PurchaseOrderRepo.getInstance(this.ctxState).softUpsert(
        {
          data: {
            customerId,
            poNumber: purchaseOrder,
            isOneTime: true,
            active: true,
          },
        },
        trx,
      );

      data.purchaseOrderId = id;
    }
  }

  orderRequestsSortField(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      total: `${this.tableName}.grandTotal`,
      customer: `${CustomerRepo.TABLE_NAME}.name`,
      jobSite: `${JobSiteRepo.TABLE_NAME}.fullAddress`,
      service: `${BillableServiceRepo.TABLE_NAME}.description`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }
}

OrderRequestRepository.TABLE_NAME = TABLE_NAME;

export default OrderRequestRepository;
