import pick from 'lodash/pick.js';

import { PaymentInvoicedStatus } from '../consts/paymentStatus.js';
import BaseModel from './_base.js';

const EVENT_TYPE = {
  created: 'created',
  edited: 'edited',
};

export default class OrderPaymentHistory extends BaseModel {
  static get tableName() {
    return 'order_payments_historical';
  }

  static async insertData(data, trx) {
    const _trx = trx || (await this.startTransaction());
    try {
      await this.query(trx).insert(data);

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

  static async logCreatedPayments(ids, userId, trx) {
    const { Payment } = this.models;
    const paymentsData = await Payment.query(trx).withGraphFetched('orders').findByIds(ids);

    paymentsData.forEach((data, i) => (data.originalId = paymentsData[i]?.id));

    const data = paymentsData.flatMap(payment =>
      payment.orders.map(({ id: orderId, assignedAmount }) => ({
        eventType: EVENT_TYPE.created,
        userId,
        ...pick(payment, [
          'originalId',
          'customerId',
          'creditCardId',
          'status',
          'date',
          'paymentType',
          'amount',
          'sendReceipt',
          'ccRetref',
          'checkNumber',
          'isAch',
          'deferredUntil',
          'prevBalance',
          'appliedAmount',
        ]),
        orderId,
        assignedAmount: Number(assignedAmount) || 0,
        invoicedStatus: PaymentInvoicedStatus.UNAPPLIED,
      })),
    );

    await this.insertData(data, trx);
  }

  static async logCapturedPayment(paymentId, { orders, amount, ccRetref, status, userId }, trx) {
    const data = orders.map(({ id: orderId, assignedAmount }) => ({
      eventType: EVENT_TYPE.edited,
      userId,
      originalId: paymentId,
      orderId,
      assignedAmount: Number(assignedAmount) || 0,
      amount: Number(amount) || 0,
      ccRetref,
      status,
    }));

    await this.insertData(data, trx);
  }

  static async logVoidedPayment(paymentId, { orders, status, userId }, trx) {
    const data = orders.map(({ id: orderId, assignedAmount }) => ({
      eventType: EVENT_TYPE.edited,
      userId,
      originalId: paymentId,
      orderId,
      assignedAmount: Number(assignedAmount) || 0,
      status,
    }));

    await this.insertData(data, trx);
  }

  static async logInvoicedPayments(applications, userId, trx) {
    const data = applications.map(
      ({ paymentId, invoiceId, orderId, appliedAmount, amount, prevBalance }) => ({
        eventType: EVENT_TYPE.edited,
        userId,
        originalId: paymentId,
        orderId,
        appliedAmount: Number(appliedAmount) || 0,
        invoiceId,
        invoicedAmount: Number(amount) || 0,
        prevBalance: Number(prevBalance) || 0,
        invoicedStatus: PaymentInvoicedStatus.APPLIED,
      }),
    );

    await this.insertData(data, trx);
  }

  static async logCreatedMultiPayment(id, userId, trx) {
    const { Payment } = this.models;
    const paymentData = await Payment.query(trx).withGraphFetched('orders').findById(id);

    paymentData.originalId = paymentData.id;

    const data = paymentData.orders.map(({ id: orderId, assignedAmount }) => ({
      eventType: EVENT_TYPE.created,
      userId,
      ...pick(paymentData, [
        'originalId',
        'customerId',
        'creditCardId',
        'status',
        'date',
        'paymentType',
        'amount',
        'sendReceipt',
        'ccRetref',
        'checkNumber',
        'isAch',
        'prevBalance',
        'appliedAmount',
      ]),
      orderId,
      assignedAmount: Number(assignedAmount) || 0,
      invoicedStatus: PaymentInvoicedStatus.UNAPPLIED,
    }));

    await this.insertData(data, trx);
  }

  static async logChargedDeferredPayment(id, userId, trx) {
    const { Payment } = this.models;
    const paymentData = await Payment.query(trx).withGraphFetched('orders').findById(id);

    const data = paymentData.orders.map(({ id: orderId, assignedAmount }) => ({
      eventType: EVENT_TYPE.edited,
      userId,
      originalId: id,
      orderId,
      assignedAmount: Number(assignedAmount) || 0,
      amount: Number(paymentData.amount) || 0,
      ...pick(paymentData, [
        'date',
        'prevBalance',
        'status',
        'ccRetref',
        // change PM case
        'paymentType',
        'checkNumber',
        'isAch',
        'creditCardId',
        'deferredUntil',
      ]),
    }));

    await this.insertData(data, trx);
  }

  static async logUpdatedDeferredPayment(
    id,
    { amount, deferredUntil, creditCardId, orders, userId },
    trx,
  ) {
    const updates = {
      amount: Number(amount) || 0,
      deferredUntil,
    };
    creditCardId && (updates.creditCardId = creditCardId);

    const data = orders.map(({ id: orderId }) => ({
      eventType: EVENT_TYPE.edited,
      userId,
      originalId: id,
      orderId,
      ...updates,
    }));

    await this.insertData(data, trx);
  }

  static async logUndeferredPayment(id, userId, trx) {
    const { Payment } = this.models;
    const paymentData = await Payment.query(trx).withGraphFetched('orders').findById(id);

    const data = paymentData.orders.map(({ id: orderId, assignedAmount }) => ({
      eventType: EVENT_TYPE.edited,
      userId,
      originalId: id,
      orderId,
      assignedAmount: Number(assignedAmount) || 0,
      deferredUntil: paymentData.deferredUntil,
    }));

    await this.insertData(data, trx);
  }

  static async logPrepaidPaymentRefund(
    paymentId,
    {
      refundedOnAccountAmount,
      refundedAmount,
      orders,
      onAccountPaymentId,
      refundAmount,
      refundCheckNumber,
      refundType,
    },
    userId,
    trx,
  ) {
    const data = orders.map(({ orderId, assignedAmount }) => ({
      eventType: EVENT_TYPE.edited,
      userId,
      originalId: paymentId,
      orderId,
      assignedAmount: Number(assignedAmount) || 0,

      refundedOnAccountAmount,
      refundedAmount,
      onAccountPaymentId,
      refundAmount,
      refundCheckNumber,
      refundType,
    }));

    await this.insertData(data, trx);
  }

  static async logTargetUpdate({ paymentId, orderId, ...data }, userId, trx) {
    await this.insertData(
      {
        eventType: EVENT_TYPE.edited,
        userId,
        originalId: paymentId,
        orderId,
        ...data,
      },
      trx,
    );
  }

  static async getAll({ condition = {}, fields = ['*'] } = {}) {
    const { Customer, CreditCard } = this.models;

    const items = await this.query()
      .where(condition)
      .select(
        fields
          .map(field => `${this.tableName}.${field}`)
          .concat([
            this.raw('json_agg(??.*) as ??', [Customer.tableName, 'customer']),
            this.raw('json_agg(??.*) as ??', [CreditCard.tableName, 'creditCard']),
          ]),
      )
      .leftJoin(Customer.tableName, `${Customer.tableName}.id`, `${this.tableName}.customerId`)
      .leftJoin(
        CreditCard.tableName,
        `${CreditCard.tableName}.id`,
        `${this.tableName}.creditCardId`,
      )
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);

    return items;
  }
}
