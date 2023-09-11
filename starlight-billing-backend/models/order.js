import uniqBy from 'lodash/uniqBy.js';
import map from 'lodash/map.js';

import { mathRound2 } from '../utils/math.js';

import { PAYMENT_METHODS } from '../consts/paymentMethod.js';
import { PaymentStatus } from '../consts/paymentStatus.js';
import BaseModel from './_base.js';

export default class Order extends BaseModel {
  static get tableName() {
    return 'orders';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'id',
        'jobSiteId',
        'customerId',
        'paymentMethod',
        'customerJobSiteId',
        'beforeTaxesTotal',
        'surchargesTotal',
        'grandTotal',
        'serviceDate',
      ],

      properties: {
        id: { type: 'integer' },
        paymentMethod: { enum: [...PAYMENT_METHODS, null] },
        beforeTaxesTotal: { type: 'number' },
        surchargesTotal: { type: 'number' },
        grandTotal: { type: 'number' },
        onAccountTotal: { type: 'number' },
        capturedTotal: { type: ['number', null] },
        refundedTotal: { type: 'number' },
        overrideCreditLimit: { type: 'boolean' },

        serviceDate: { type: 'string' },
        invoiceNotes: { type: ['string', null] },

        woNumber: { type: ['integer', null] },
        poNumber: { type: ['string', null] },
        ticketUrl: { type: 'string' },
        receiptPreviewUrl: { type: 'string' },
        receiptPdfUrl: { type: 'string' },

        jobSiteId: { type: 'integer' },
        customerId: { type: 'integer' },
        customerJobSiteId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const {
      OrderLineItem,
      Invoice,
      Payment,
      JobSite,
      Customer,
      CustomerJobSite,
      MediaFile,
      BusinessLine,
    } = this.models;
    return {
      businessLine: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BusinessLine,
        join: {
          from: `${this.tableName}.businessLineId`,
          to: `${BusinessLine.tableName}.id`,
        },
      },
      jobSite: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: JobSite,
        join: {
          from: `${this.tableName}.jobSiteId`,
          to: `${JobSite.tableName}.id`,
        },
      },
      customer: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.customerId`,
          to: `${Customer.tableName}.id`,
        },
      },
      customerJobSite: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: CustomerJobSite,
        join: {
          from: `${this.tableName}.customerJobSiteId`,
          to: `${CustomerJobSite.tableName}.id`,
        },
      },
      lineItems: {
        relation: BaseModel.HasManyRelation,
        modelClass: OrderLineItem,
        join: {
          from: `${this.tableName}.id`,
          to: `${OrderLineItem.tableName}.orderId`,
        },
      },
      invoice: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.invoiceId`,
          to: `${Invoice.tableName}.id`,
        },
      },
      payments: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'ordersPayments.orderId',
            to: 'ordersPayments.paymentId',
            extra: ['assignedAmount', 'receiptPreviewUrl', 'receiptPdfUrl'],
          },
          to: `${Payment.tableName}.id`,
        },
      },
      mediaFiles: {
        relation: BaseModel.HasManyRelation,
        modelClass: MediaFile,
        join: {
          from: `${this.tableName}.id`,
          to: `${MediaFile.tableName}.orderId`,
        },
      },
    };
  }

  static async insertMany({ data: { orders, paymentMethod, customerId } } = {}, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    let newOrders;
    try {
      newOrders = await this.query(trx).upsertGraphAndFetch(
        orders.map(order => ({
          ...order,
          paymentMethod,
          customer: { id: customerId },
        })),
        {
          insertMissing: true,
          noDelete: true,
          noInsert: ['jobSite', 'customerJobSite'],
          relate: ['customerJobSite', 'customer', 'jobSite'],
          noUpdate: ['invoices', 'payments', 'jobSite', 'customerJobSite'],
        },
      );

      if (!outerTransaction) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }

      throw error;
    }

    return newOrders;
  }

  static async insertNewOrdersAndRelatedData(
    { orders, customerId, paymentMethod, paymentsData, businessUnitId },
    { log, userId } = {},
  ) {
    const { CustomerJobSite, Payment } = this.models;

    const trx = await this.startTransaction();

    try {
      await CustomerJobSite.upsertMany({ data: uniqBy(map(orders, 'customerJobSite'), 'id') }, trx);

      await this.insertMany(
        {
          data: {
            orders,
            paymentMethod,
            customerId,
          },
        },
        trx,
      );

      if (paymentsData?.length) {
        await Payment.insertManyForPrepaid({ paymentsData, businessUnitId, userId }, trx, {
          log,
          userId,
        });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  static async recalculateCapturedTotals(orderIds) {
    const trx = await this.startTransaction();

    let orders;
    try {
      await this.query()
        .findByIds(orderIds)
        .patch({
          capturedTotal: this.fn.coalesce(
            this.relatedQuery('payments')
              .sum('assignedAmount')
              .where('status', PaymentStatus.CAPTURED),
            0,
          ),
        });

      orders = await this.query().findByIds(orderIds);

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    return orders;
  }

  static async populateCreditCardForRefund(orders) {
    await Promise.all(
      orders.map(async order => {
        order.creditCardId = (
          await order
            .$relatedQuery('payments')
            .select('creditCardId')
            .whereNotNull('creditCardId')
            .andWhere('assignedAmount', '>', order.overpaidAmount ?? 0)
            .first()
        )?.creditCardId;
      }),
    );

    return orders;
  }

  async $addReceipt({ pdfUrl, previewUrl }) {
    await this.$query().patch({
      receiptPreviewUrl: previewUrl,
      receiptPdfUrl: pdfUrl,
    });
  }

  static async getTotalPaidAmount(orderIds, trx) {
    const { capturedTotal = 0 } = await this.query(trx)
      .findByIds(orderIds)
      .sum({ capturedTotal: 'capturedTotal' })
      .first();

    return mathRound2(Number(capturedTotal));
  }

  static async isFullyCaptured(orderIds, trx) {
    const { isFullyCaptured } = await this.query(trx)
      .findByIds(orderIds)
      .select(
        this.raw(
          "bool_and(payment_method = 'onAccount' or override_credit_limit = true or captured_total + on_account_total >= grand_total) as is_fully_captured",
        ),
      )
      .first();

    return isFullyCaptured ?? false;
  }

  async $getPayments(fields = ['*']) {
    const items = await this.$relatedQuery('payments').select(fields);
    return items;
  }

  static async getCapturedPrepaidPayment(orderId) {
    const { Payment } = this.models;

    const item = await this.relatedQuery('payments')
      .for(orderId)
      .where(Payment.ref('status'), PaymentStatus.CAPTURED)
      .andWhere(Payment.ref('amount'), '!=', Payment.ref('refundedAmount'))
      .orderBy(Payment.ref('id'), 'desc')
      .first();

    return item;
  }

  static async getPrepaidOrDeferredPayments(orderId) {
    const { Payment } = this.models;

    const items = await this.relatedQuery('payments')
      .withGraphFetched('orders')
      .for(orderId)
      .andWhere(builder =>
        builder
          .where(qb =>
            qb
              .where(Payment.ref('status'), PaymentStatus.CAPTURED)
              .andWhere(element =>
                element
                  .where(Payment.ref('amount'), '!=', Payment.ref('refundedAmount'))
                  .orWhere(Payment.ref('amount'), 0),
              ),
          )
          .orWhere(qb =>
            qb
              // not null 'deferredUntil' means a payment is deferred or was deferred but failed
              .whereNotNull('deferredUntil')
              .andWhere(Payment.ref('status'), PaymentStatus.FAILED),
          )
          .orWhere(Payment.ref('status'), PaymentStatus.DEFERRED),
      )
      .orderBy(Payment.ref('id'), 'asc')
      .withGraphFetched('creditCard');

    return items;
  }

  static async getDeferredPayment(orderId) {
    const { Payment } = this.models;

    const item = await this.relatedQuery('payments')
      .for(orderId)
      .where({ canceled: false })
      .andWhere(builder =>
        builder
          .where(qb =>
            qb
              // not null 'deferredUntil' means a payment is deferred or was deferred but failed
              .whereNotNull('deferredUntil')
              .andWhere(Payment.ref('status'), PaymentStatus.FAILED),
          )
          .orWhere(Payment.ref('status'), PaymentStatus.DEFERRED),
      )
      .withGraphFetched('creditCard')
      .orderBy(Payment.ref('id'), 'asc')
      .first();

    return item;
  }

  static async getAllByPaymentId(paymentId) {
    const { Payment } = this.models;

    const items = await Payment.relatedQuery('orders').for(paymentId);

    return items;
  }

  static async getDeferredPaymentOrders(orderId) {
    const { Payment } = this.models;

    const items = await this.relatedQuery('payments')
      .for(orderId)
      .where(Payment.ref('status'), PaymentStatus.DEFERRED)
      .select('orders.*')
      .leftJoinRelated('orders');

    return items;
  }

  static async putOnAccount(ids, { overrideCreditLimit }) {
    const update = {
      onAccountTotal: this.raw('?? - ??', ['grandTotal', 'capturedTotal']),
    };

    if (overrideCreditLimit) {
      update.overrideCreditLimit = true;
    }

    const rowsNumber = await this.query().patch(update).whereIn('id', ids);

    return rowsNumber > 0;
  }

  static getAllPaginated({ offset, limit }) {
    return this.query().offset(offset).limit(limit).orderBy('serviceDate').orderBy('id');
  }
}
