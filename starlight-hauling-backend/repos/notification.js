import startCase from 'lodash/startCase.js';

import { DISPATCH_ACTION } from '../consts/workOrder.js';
import { ACTION } from '../consts/actions.js';
import BaseRepository from './_base.js';

import OrderRequestRepo from './orderRequest.js';
import OrderRepo from './order.js';

const TABLE_NAME = 'notifications';

class NotificationRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async fetchOrderData(id, trx = this.knex) {
    const salesOrder = await OrderRepo.getInstance(this.ctxState).getBy(
      {
        condition: { id },
        fields: [
          'id',
          'serviceDate',
          'billableServiceId',
          'equipmentItemId',
          'materialId',
          'jobSiteId',
        ],
      },
      trx,
    );

    const { action } = salesOrder.billableService ?? {};
    const { description: can } = salesOrder.equipmentItem;
    const { description: material } = salesOrder.material;
    const {
      jobSite: { addressLine1, addressLine2, city, state, zip },
      serviceDate,
    } = salesOrder;
    const address = [addressLine1, addressLine2, city, state, zip].filter(Boolean).join(', ');

    const camelCasedAction =
      action === ACTION.dumpReturn
        ? 'Dump & Return'
        : startCase(DISPATCH_ACTION[action]?.toLowerCase() || ACTION[action]);

    return {
      can,
      action: camelCasedAction,
      material,
      address,
      serviceDate: serviceDate.toDateString(),
    };
  }

  async getOrderRequestConfirmedMsgBody(orderId, trx = this.knex) {
    const { can, action, material, address, serviceDate } = await this.fetchOrderData(orderId, trx);

    // eslint-disable-next-line max-len
    return `Your order for a ${can} container ${action} for ${material} at ${address}, scheduled for ${serviceDate}, is confirmed (Sales Order #${orderId})`;
  }

  async getOrderInvoicedMsgBody(orderId, trx) {
    const { can, action, material, address, serviceDate } = await this.fetchOrderData(orderId, trx);

    // eslint-disable-next-line max-len
    return `Your order for a ${can} container ${action} for ${material} at ${address}, scheduled for ${serviceDate}, is invoiced (Sales Order #${orderId})`;
  }

  getReportReadyMsgBody({ fromDate, toDate }) {
    return `Your report is ready: \r\nMaterials By Date ${fromDate.toLocaleDateString()} through ${toDate.toLocaleDateString()}`;
  }

  async fetchOrderRequestData(id, trx = this.knex) {
    const orderRequest = await OrderRequestRepo.getInstance(this.ctxState).getAllByIdPopulated(
      { condition: { id } },
      trx,
    );

    const { description: can } = orderRequest.equipmentItem;
    const { action } = orderRequest.billableService;
    const { description: material } = orderRequest.material;
    const {
      jobSite: { addressLine1, addressLine2, city, state, zip },
      serviceDate,
    } = orderRequest;
    const address = [addressLine1, addressLine2, city, state, zip].filter(Boolean).join(', ');

    return { can, action, material, address, serviceDate: serviceDate.toDateString() };
  }

  async getOrderRequestCanceledMsgBody(orderRequestId, trx = this.knex) {
    const orderRequest = await OrderRequestRepo.getInstance(this.ctxState).getAllByIdPopulated(
      { condition: { id: orderRequestId } },
      trx,
    );

    const {
      jobSite: { addressLine1, addressLine2, city, state, zip },
    } = orderRequest;
    const address = [addressLine1, addressLine2, city, state, zip].filter(Boolean).join(', ');

    return `Your order request for ${address} is canceled`;
  }

  getAllPaginated(
    { condition: { contractorId }, skip = 0, limit = 25, fields = ['*'] } = {},
    trx = this.knex,
  ) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields.map(field => `${this.tableName}.${field}`))
      .where({ contractorId })
      .limit(limit)
      .offset(skip)
      .orderBy(`${this.tableName}.id`, 'desc');
  }

  async countBy({ condition: { contractorId } } = {}, trx = this.knex) {
    const [result] = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ contractorId })
      .count(`${this.tableName}.id`);

    return Number(result?.count) || 0;
  }
}

NotificationRepository.TABLE_NAME = TABLE_NAME;

export default NotificationRepository;
