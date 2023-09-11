import map from 'lodash/fp/map.js';
import sumBy from 'lodash/sumBy.js';
import isEmpty from 'lodash/isEmpty.js';
import groupBy from 'lodash/groupBy.js';
import * as dateFns from 'date-fns';

import { dispatchOrders, updateOrdersPaymentMethods } from '../services/core.js';

import { shouldBeIncludedInBankDeposit } from '../utils/payment.js';
import { mathRound2 } from '../utils/math.js';

import ApplicationError from '../errors/ApplicationError.js';

import { InvoiceType } from '../consts/invoiceTypes.js';
import { BankDepositType } from '../consts/bankDepositTypes.js';
import { StatementSection } from '../consts/statementSections.js';
import { PAYMENT_STATUSES, PaymentStatus, PaymentInvoicedStatus } from '../consts/paymentStatus.js';
import { PAYMENT_TYPES, PaymentType } from '../consts/paymentTypes.js';
import { RefundType } from '../consts/refundType.js';
import { dbAliases } from '../consts/dbAliases.js';
import { PaymentSorting } from '../consts/paymentSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import { DeferredPaymentSorting } from '../consts/deferredPaymentSorting.js';
import BaseModel from './_base.js';

const pluckId = map('id');

export default class Payment extends BaseModel {
  static get tableName() {
    return 'payments';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'status',
        'date',
        'paymentType',
        'amount',
        'appliedAmount',
        'prevBalance',
        'sendReceipt',
        'customerId',
        'userId',
      ],

      properties: {
        id: { type: 'integer' },
        status: { enum: PAYMENT_STATUSES },
        date: { type: 'string' },
        paymentType: { enum: PAYMENT_TYPES },
        amount: { type: 'number' },
        ccRetref: { type: ['string', null] },
        checkNumber: { type: ['string', null] },
        isAch: { type: 'boolean' },
        memoNote: { type: ['string', null] },
        billableItemType: { type: ['string', null] },
        billableItemId: { type: ['number'] },

        prevBalance: { type: 'number' },
        appliedAmount: { type: 'number' },
        reversedAmount: { type: 'number' },
        paidOutAmount: { type: 'number' },
        refundedAmount: { type: 'number' },
        refundedOnAccountAmount: { type: 'number' },
        isPrepay: { type: 'boolean' },
        canceled: { type: 'boolean' },
        sendReceipt: { type: 'boolean' },
        deferredUntil: { type: ['string', null] },

        customerId: { type: 'integer' },
        creditCardId: { type: ['integer', null] },
        userId: { type: 'string', default: 'system' },
      },

      allOf: [
        {
          if: {
            properties: {
              paymentType: { not: { const: PaymentType.CREDIT_MEMO } },
            },
          },
          then: {
            properties: {
              memoNote: { type: null },
            },
          },
        },
      ],
    };
  }

  static get relationMappings() {
    const {
      BankDeposit,
      BusinessUnit,
      Customer,
      Order,
      CreditCard,
      Invoice,
      RefundedPayment,
      ReversedPayment,
      SettlementTransaction,
    } = this.models;
    return {
      bankDeposit: {
        relation: BaseModel.HasOneThroughRelation,
        modelClass: BankDeposit,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'bankDepositPayment.paymentId',
            to: 'bankDepositPayment.bankDepositId',
          },
          to: `${BankDeposit.tableName}.id`,
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
      businessUnit: {
        relation: BaseModel.HasOneThroughRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.customerId`,
          through: {
            from: `${Customer.tableName}.id`,
            to: `${Customer.tableName}.businessUnitId`,
          },
          to: `${BusinessUnit.tableName}.id`,
        },
      },
      refundData: {
        relation: BaseModel.HasManyRelation,
        modelClass: RefundedPayment,
        join: {
          from: `${this.tableName}.id`,
          to: `${RefundedPayment.tableName}.paymentId`,
        },
      },
      originalPayment: {
        // One from which refund was made
        relation: BaseModel.HasOneRelation,
        modelClass: RefundedPayment,
        join: {
          from: `${this.tableName}.id`,
          to: `${RefundedPayment.tableName}.onAccountPaymentId`,
        },
      },
      reverseData: {
        relation: BaseModel.HasOneRelation,
        modelClass: ReversedPayment,
        join: {
          from: `${this.tableName}.id`,
          to: `${ReversedPayment.tableName}.id`,
        },
      },
      orders: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'ordersPayments.paymentId',
            to: 'ordersPayments.orderId',
            extra: ['assignedAmount', 'receiptPreviewUrl', 'receiptPdfUrl'],
          },
          to: `${Order.tableName}.id`,
        },
      },
      creditCard: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: CreditCard,
        join: {
          from: `${this.tableName}.creditCardId`,
          to: `${CreditCard.tableName}.id`,
        },
      },
      invoices: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'paymentApplications.paymentId',
            to: 'paymentApplications.invoiceId',
            extra: ['amount', 'prevBalance'],
          },
          to: `${Invoice.tableName}.id`,
        },
      },
      settlementTransaction: {
        relation: BaseModel.HasOneRelation,
        modelClass: SettlementTransaction,
        join: {
          from: `${this.tableName}.ccRetref`,
          to: `${SettlementTransaction.tableName}.ccRetref`,
        },
      },
    };
  }

  get newBalance() {
    return (
      Number(this.prevBalance) -
      Number(this.amount) +
      Number(this.paidOutAmount) +
      Number(this.refundedAmount) +
      Number(this.refundedOnAccountAmount)
    );
  }

  async $getOriginalPaymentId() {
    const payment = await this.$relatedQuery('originalPayment');
    return payment?.paymentId;
  }

  async $isEditable() {
    const { constructor: model, id, isPrepay } = this;
    const { schemaName } = model;
    const trx = this.$knex();

    const statementItem = await trx('statementsItems')
      .withSchema(schemaName)
      .where({ paymentId: id, section: StatementSection.PAYMENTS_CURRENT })
      .select('id')
      .first();

    return !isPrepay && !statementItem?.id;
  }

  static async createOne(
    ctx,
    { data: { customerId, businessUnitId, creditCardId, applications, ...data } } = {},
    { logOrderHistory = false, log, userId } = {},
  ) {
    const { BankDeposit, OrderPaymentHistory } = this.models;
    const inludeBd = shouldBeIncludedInBankDeposit(data.paymentType);

    const trx = await this.startTransaction();

    let payment, bankDeposit, bdUpdate;
    try {
      if (inludeBd) {
        ({ bankDeposit, update: bdUpdate } = await BankDeposit.upsertAndFetchCurrentDeposit(
          {
            condition: {
              businessUnitId,
              type: BankDepositType.CASH_CHECK,
            },
            data: {
              count: 1,
              total: data.amount,
            },
          },
          trx,
        ));
      }

      payment = await this.query(trx).insertGraphAndFetch(
        {
          ...data,
          customer: customerId ? { id: customerId } : undefined,
          creditCard: creditCardId ? { id: creditCardId } : undefined,
          bankDeposit: bankDeposit ? { id: bankDeposit.id } : undefined,
        },
        {
          relate: ['creditCard', 'customer', 'orders', 'bankDeposit'],
        },
      );

      const { id } = payment;
      if (!isEmpty(applications)) {
        payment = await this.applyToInvoices(ctx, id, { applications }, trx);
      }

      if (logOrderHistory) {
        await OrderPaymentHistory.logCreatedMultiPayment(id, userId, trx);
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (log) {
      let entity;
      if (
        [
          PaymentType.CREDIT_MEMO,
          PaymentType.WRITE_OFF,
          // PaymentType.REFUND_ON_ACCOUNT, Payment
        ].includes(data.paymentType)
      ) {
        entity = this.logEntity[data.paymentType];
      }

      payment.$log({ userId, action: this.logAction.create, entity });

      if (inludeBd) {
        bankDeposit.$log({
          userId,
          action: bdUpdate ? this.logAction.modify : this.logAction.create,
          entity: this.logEntity.bankDeposits,
        });
      }
    }

    return payment;
  }

  static async insertManyForPrepaid(
    { paymentsData = [], businessUnitId, userId },
    outerTrx,
    { log } = {},
  ) {
    const { BankDeposit, OrderPaymentHistory } = this.models;

    const trx = outerTrx ?? (await this.startTransaction());

    let payments, bankDeposit, bdUpdate;
    try {
      const cashCheckPayments = paymentsData.filter(({ paymentType }) =>
        shouldBeIncludedInBankDeposit(paymentType),
      );

      ({ bankDeposit, update: bdUpdate } = await BankDeposit.upsertAndFetchCurrentDeposit(
        {
          condition: {
            businessUnitId,
            type: BankDepositType.CASH_CHECK,
          },
          data: {
            count: cashCheckPayments.length,
            total: sumBy(cashCheckPayments, 'amount'),
          },
        },
        trx,
      ));

      payments = await this.query(trx).insertGraphAndFetch(
        paymentsData.map(({ customerId, creditCardId, ...data }) => ({
          ...data,

          customer: { id: customerId },
          creditCard: creditCardId ? { id: creditCardId } : undefined,
          bankDeposit:
            bankDeposit && shouldBeIncludedInBankDeposit(data.paymentType)
              ? { id: bankDeposit.id }
              : undefined,
        })),
        {
          relate: ['customer', 'creditCard', 'orders', 'bankDeposit'],
        },
      );

      await OrderPaymentHistory.logCreatedPayments(
        payments.map(({ id }) => id),
        userId,
        trx,
      );

      if (!outerTrx) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTrx) {
        await trx.rollback();
      }
      throw error;
    }

    if (log && payments?.length) {
      const action = this.logAction.create;
      payments.forEach(payment => payment.$log({ userId, action }));

      bankDeposit &&
        this.log({
          id: bankDeposit.id,
          userId,
          action: bdUpdate ? this.logAction.modify : this.logAction.create,
          entity: this.logEntity.bankDeposits,
        });
    }
  }

  static async getAllByOrderIds(orderIds = []) {
    const { Order } = this.models;

    const items = await Order.relatedQuery('payments')
      .for(orderIds)
      .withGraphFetched('[orders, creditCard.merchant]')
      .distinctOn(this.ref('id'));

    return items;
  }

  static async getAllPaginated({
    condition: { customerId, businessUnitId, filters, searchId, searchQuery } = {},
    limit,
    offset,
    sortBy = PaymentSorting.DATE,
    sortOrder = SortOrder.DESC,
  }) {
    const { BankDeposit, Customer, CreditCard, Invoice } = this.models;

    let query = customerId ? Customer.relatedQuery('payments').for(customerId) : this.query();

    const bdQueryAlias = 'bank_deposit_query';

    query.leftJoin(
      BankDeposit.query()
        .select([BankDeposit.ref('id'), BankDeposit.ref('date'), 'bankDepositPayment.paymentId'])
        .innerJoin('bankDepositPayment', 'bankDepositPayment.bankDepositId', BankDeposit.ref('id'))
        .where(BankDeposit.ref('depositType'), '!=', BankDepositType.REVERSAL)
        .as(bdQueryAlias),
      `${bdQueryAlias}.paymentId`,
      this.ref('id'),
    );

    if (businessUnitId || searchQuery?.length >= 3) {
      query = query.joinRelated('customer', { alias: dbAliases[Customer.tableName] });
      if (businessUnitId) {
        query = query.where(`${dbAliases[Customer.tableName]}.businessUnitId`, businessUnitId);
      }
    }

    if (searchId) {
      query = query.leftJoinRelated('[invoices, creditCard]', {
        aliases: {
          invoices: dbAliases[Invoice.tableName],
          creditCard: dbAliases[CreditCard.tableName],
        },
      });
    }

    query = this.applySearchToQuery(query, { searchId, searchQuery });
    query = this.applyFiltersToQuery(query, filters);
    if (sortBy === PaymentSorting.CUSTOMER) {
      sortBy = `${dbAliases[Customer.tableName]}.name`;
    } else if (sortBy === PaymentSorting.PAYMENT_FORM) {
      sortBy = this.ref('payment_type');
    } else if (sortBy === PaymentSorting.STATUS) {
      sortBy = this.ref('invoiced_status');
    } else if (sortBy === PaymentSorting.PAYMENT_ID) {
      sortBy = this.ref('id');
    } else if (sortBy === PaymentSorting.DEPOSIT_DATE) {
      sortBy = `${bdQueryAlias}.date`;
    } else {
      sortBy = this.ref(sortBy);
    }

    const items = await query
      .select(`${this.tableName}.*`, `${bdQueryAlias}.date as bankDepositDate`)
      .limit(limit)
      .offset(offset)
      .andWhere(builder =>
        builder
          // unapplied payments have no ref to orders
          .whereNotExists(this.relatedQuery('orders'))
          .orWhere(builder1 =>
            builder1.whereExists(this.relatedQuery('orders')).andWhere(builder2 =>
              builder2
                // already invoiced orders so applied to some invoices
                .where('appliedAmount', '>', 0)
                // reversed payments
                .orWhere('reversedAmount', '>', 0),
            ),
          ),
      )
      .orderByRaw(`?? ${sortOrder}`, [sortBy]);

    return items;
  }

  static applySearchToQuery(originalQuery, { searchId, searchQuery }) {
    const { Customer, CreditCard, Invoice } = this.models;
    let query = originalQuery;

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
        builder.orWhere(`${dbAliases[Invoice.tableName]}.id`, searchId);
        builder.orWhere(`${dbAliases[CreditCard.tableName]}.cardNumberLastDigits`, searchId);
      }

      if (searchQuery) {
        builder.orWhere({ checkNumber: searchQuery });
      }

      if (searchQuery?.length >= 3) {
        builder
          .orWhereRaw(`? % ${dbAliases[Customer.tableName]}.name`, [searchQuery])
          .orderByRaw(`? <-> ${dbAliases[Customer.tableName]}.name`, [searchQuery]);
      }

      return builder;
    });

    return query;
  }

  static applyFiltersToQuery(
    originalQuery,
    {
      filterByCreatedFrom,
      filterByCreatedTo,
      filterByInvoicedStatus,
      filterByType,
      filterByAmountFrom,
      filterByAmountTo,
      filterByUnappliedFrom,
      filterByUnappliedTo,
      filterByUser,
    } = {},
  ) {
    let query = originalQuery;

    if (filterByType?.length) {
      query = query.whereIn(this.ref('paymentType'), filterByType);
    }

    if (filterByInvoicedStatus?.length) {
      query = this.applyInvoicedStatusFilter(query, { filterByInvoicedStatus });
    }

    if (filterByUser?.length) {
      query = query.whereIn(this.ref('userId'), filterByUser);
    }

    if (filterByCreatedFrom) {
      query = query.andWhere(this.ref('createdAt'), '>=', filterByCreatedFrom);
    }

    if (filterByCreatedTo) {
      query = query.andWhere(this.ref('createdAt'), '<=', filterByCreatedTo);
    }

    if (typeof filterByAmountFrom === 'number') {
      query = query.andWhere(this.ref('amount'), '>=', filterByAmountFrom);
    }

    if (typeof filterByAmountTo === 'number') {
      query = query.andWhere(this.ref('amount'), '<=', filterByAmountTo);
    }

    query = this.applyUnappliedAmountFilter(query, {
      filterByUnappliedFrom,
      filterByUnappliedTo,
    });

    return query;
  }

  static applyInvoicedStatusFilter(originalQuery, { filterByInvoicedStatus }) {
    let query = originalQuery;

    query = query.andWhere(builder => {
      if (filterByInvoicedStatus.includes(PaymentInvoicedStatus.REVERSED)) {
        builder.orWhere(this.ref('reversedAmount'), '>', 0);
      }

      if (filterByInvoicedStatus.includes(PaymentInvoicedStatus.UNAPPLIED)) {
        builder.orWhere(qb =>
          qb.whereNotExists(this.relatedQuery('orders')).andWhereRaw(
            `${this.tableName}.amount > applied_amount + paid_out_amount +
                    refunded_on_account_amount + refunded_amount`,
          ),
        );
      }

      if (filterByInvoicedStatus.includes(PaymentInvoicedStatus.APPLIED)) {
        builder.orWhere(qb =>
          qb
            .whereRaw(
              `${this.tableName}.amount <= applied_amount + paid_out_amount +
                   refunded_on_account_amount + refunded_amount`,
            )
            .andWhere(this.ref('reversedAmount'), 0),
        );
      }

      return builder;
    });

    return query;
  }

  static applyUnappliedAmountFilter(originalQuery, { filterByUnappliedFrom, filterByUnappliedTo }) {
    let query = originalQuery;

    if (filterByUnappliedFrom) {
      query = query.andWhereRaw(
        `(amount - applied_amount + paid_out_amount +
                    refunded_on_account_amount + refunded_amount) >= ?`,
        [filterByUnappliedFrom],
      );
    }

    if (filterByUnappliedTo) {
      query = query.andWhereRaw(
        `(amount - applied_amount + paid_out_amount +
                    refunded_on_account_amount + refunded_amount) <= ?`,
        [filterByUnappliedTo],
      );
    }

    return query;
  }

  static async getAllCreatedInRange({ customerId, from, to, fields = ['*'] } = {}) {
    const items = await this.query()
      .where({ customerId })
      .andWhere('createdAt', '<=', to)
      .andWhere('createdAt', '>=', from)
      .select(fields);

    return items;
  }

  static async getAllUpdatedInRange({ customerId, from, to } = {}) {
    const trx = this.knex();

    const items = await this.query()
      .where({ customerId })
      .andWhere(qb =>
        qb
          .whereExists(
            trx('payoutApplications')
              .withSchema(this.schemaName)
              .whereRaw('payment_id = payments.id')
              .andWhereRaw('created_at >= ? and created_at <= ?', [from, to])
              .select(1),
          )
          .orWhereExists(
            trx('reversePayments')
              .withSchema(this.schemaName)
              .whereRaw('payment_id = payments.id')
              .andWhereRaw('created_at >= ? and created_at <= ?', [from, to])
              .select(1),
          )
          .orWhereExists(
            trx('refundPayments')
              .withSchema(this.schemaName)
              .whereRaw('payment_id = payments.id')
              .andWhereRaw('created_at >= ? and created_at <= ?', [from, to])
              .select(1),
          ),
      )
      .select(`${this.tableName}.*`);
    return items;
  }

  static async getUnconfirmedBySettlement({ condition: { settlementId } }) {
    const { Settlement } = this.models;

    const settlement = await Settlement.getById(settlementId);

    if (!settlement) {
      throw ApplicationError.notFound(`Settlement with id: ${settlementId} not found`);
    }

    const date = dateFns.subDays(settlement.date, 1);

    const payments = await this.query()
      .where({
        date,
        paymentType: PaymentType.CREDIT_CARD,
        [`${this.tableName}.status`]: PaymentStatus.CAPTURED,
      })
      .whereNotExists(this.relatedQuery('settlementTransaction'))
      .leftJoinRelated('[customer, creditCard]', {
        aliases: {
          customer: 'c',
          creditCard: 'cc',
        },
      })
      .andWhere('c.businessUnitId', settlement.businessUnitId)
      .andWhere('cc.merchantId', settlement.merchantId)
      .andWhere('cc.spUsed', settlement.spUsed);

    return payments;
  }

  static async getDeferredPaginated({
    condition: { customerId, businessUnitId, failedOnly = false } = {},
    limit = 25,
    offset = 0,
    sortBy = DeferredPaymentSorting.DEFERRED_UNTIL,
    sortOrder = SortOrder.DESC,
  }) {
    const { Customer } = this.models;

    let query;

    if (customerId) {
      query = Customer.relatedQuery('payments').for(customerId);
    } else if (businessUnitId) {
      query = this.query()
        .joinRelated('customer', { alias: 'c' })
        .where('c.businessUnitId', businessUnitId);
    } else {
      query = this.query();
    }

    if (failedOnly) {
      query = query.where(this.ref('status'), PaymentStatus.FAILED);
    } else {
      query = query.whereIn(this.ref('status'), [PaymentStatus.DEFERRED, PaymentStatus.FAILED]);
    }

    if (sortBy === PaymentSorting.CUSTOMER) {
      sortBy = `${dbAliases[Customer.tableName]}.name`;
    }

    const items = await query
      .limit(limit)
      .offset(offset)
      // not null 'deferredUntil' means a payment is deferred or was deferred but failed
      .whereNotNull('deferredUntil')
      .orderBy(this.ref(sortBy), sortOrder)
      .orderBy(this.ref('id'));

    return items;
  }

  static async getAllForCharge() {
    const items = await this.query()
      .where('status', PaymentStatus.DEFERRED)
      .andWhereRaw('cast(deferred_until as date) = current_date')
      .withGraphFetched('businessUnit');

    return items;
  }

  static async getAllForFailedNotification(paymentIds) {
    const items = await this.query().findByIds(paymentIds).withGraphFetched('[customer,orders]');

    return items;
  }

  static async applyToInvoices(ctx, paymentId, { applications }, outerTrx, { log, userId } = {}) {
    if (isEmpty(applications)) {
      throw ApplicationError.invalidRequest('Applications can not be empty');
    }

    const { Invoice, FinanceCharge } = this.models;
    let payment;
    const trx = outerTrx ?? (await this.startTransaction());

    try {
      const existingPaymentApplications = await trx('paymentApplications')
        .withSchema(this.schemaName)
        .where({ paymentId })
        .select('*');

      const invoicesToUpdate = applications.map(({ invoiceId }) => Number(invoiceId));
      const applicationsToUpdate = {};

      existingPaymentApplications?.forEach(({ invoiceId, amount }) => {
        if (invoicesToUpdate.includes(invoiceId)) {
          applicationsToUpdate[invoiceId] = amount;
        }
      });

      const applicationsWithBalance = await Promise.all(
        applications.map(async application => {
          const { invoiceId, amount } = application;
          let diff = applicationsToUpdate[invoiceId] || 0;
          diff = mathRound2(amount - diff);

          const invoice = await Invoice.decrementBalance({ id: invoiceId, amount: diff }, trx, {
            log,
            userId,
          });

          if (Number(invoice.balance) < 0) {
            throw ApplicationError.conflict(`Invoice ${invoice.id} is already closed`);
          }

          if (invoice.type === InvoiceType.FINANCE_CHARGES) {
            await FinanceCharge.decrementBalance({ amount: diff, invoiceId }, trx, {
              log,
              userId,
            });
          }

          return {
            ...application,
            prevBalance: mathRound2(Number(invoice.balance) + diff),
            paymentId,
          };
        }),
      );

      await trx('paymentApplications')
        .withSchema(this.schemaName)
        .insert(applicationsWithBalance)
        .onConflict(['invoiceId', 'paymentId'])
        .merge();

      if (applications.some(({ amount }) => !amount)) {
        await trx('paymentApplications').withSchema(this.schemaName).where('amount', 0).del();
      }

      payment = await this.query(trx)
        .findById(paymentId)
        .patch({
          appliedAmount: trx('paymentApplications')
            .withSchema(this.schemaName)
            .sum('amount')
            .where('paymentId', trx.ref('payments.id')),
        })
        .returning('*');

      // TODO check if calculate with payout too
      if (Number(payment.appliedAmount) > Number(payment.amount)) {
        throw ApplicationError.conflict(
          'Payment applied amount can not be greater than total amount',
        );
      }

      if (!outerTrx) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTrx) {
        await trx.rollback();
      }

      throw error;
    }

    log && payment.$log({ userId, action: this.logAction.modify });

    return payment;
  }

  static async applyToInvoicesAutomatically({ orderIds, userId }, outerTrx) {
    const { OrderPaymentHistory } = this.models;
    let applications;

    const trx = outerTrx ?? (await this.startTransaction());

    try {
      applications = await this.query(trx)
        .joinRelated('orders.invoice')
        .whereIn('orderId', orderIds)
        .andWhere(this.ref('status'), PaymentStatus.CAPTURED)
        .select({
          invoiceId: trx.ref('orders:invoice.id'),
          paymentId: this.ref('id'),
          orderIds: this.raw('array_agg(??)', [`orderId`]),
          amount: this.fn.sum(trx.ref('assignedAmount')),
          // We use total as prevBalance here because automatic application happens only once.
          prevBalance: trx.ref('orders:invoice.total'),
        })
        .groupBy([trx.ref('orders:invoice.id'), this.ref('id')]);

      if (applications?.length) {
        await trx('paymentApplications')
          .withSchema(this.schemaName)
          .insert(applications.map(({ orderIds: _, ...item }) => item));
      } else {
        return [];
      }

      const appliedAmounts = await this.query(trx)
        .findByIds(applications.map(({ paymentId }) => paymentId))
        .patch({
          appliedAmount: trx('paymentApplications')
            .withSchema(this.schemaName)
            .sum('amount')
            .where('paymentId', trx.ref('payments.id')),
        })
        .returning(['id', 'appliedAmount']);

      const groupedAppliedAmounts = groupBy(appliedAmounts, 'id');
      const logInfo = applications.flatMap(({ orderIds: newOrdersId, ...item }) =>
        newOrdersId.map(orderId => ({
          ...item,
          orderId,
          appliedAmount: groupedAppliedAmounts[item.paymentId],
        })),
      );

      await OrderPaymentHistory.logInvoicedPayments(logInfo, userId, trx);

      if (!outerTrx) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTrx) {
        await trx.rollback();
      }
      throw error;
    }

    return applications?.map(({ paymentId }) => paymentId) ?? [];
  }

  static async getByIdWithBu(id) {
    const item = await this.query().withGraphFetched('businessUnit').findById(id);
    return item;
  }

  async $reverse({ businessUnitId, reverseData }, { log, userId } = {}) {
    const { constructor: model, id } = this;
    const {
      models: { BankDeposit },
      schemaName,
    } = model;
    let payment, bankDeposit, bdUpdate;

    const trx = await model.startTransaction();
    try {
      ({ bankDeposit, update: bdUpdate } = await BankDeposit.upsertAndFetchCurrentDeposit(
        {
          condition: {
            businessUnitId,
            type: BankDepositType.REVERSAL,
          },
          data: { count: 1, total: reverseData.amount },
        },
        trx,
      ));

      const paymentData = {
        id,
        reversedAmount: reverseData.amount,
        appliedAmount: reverseData.amount,
        bankDeposit: { id: bankDeposit.id },
        reverseData: { ...reverseData, paymentId: id },
      };

      payment = await model.query(trx).upsertGraphAndFetch(paymentData, {
        insertMissing: true,
        noDelete: true,
        noInsert: ['bankDeposit'],
        relate: ['bankDeposit'],
        noUpdate: [
          'creditCard',
          'customer',
          'orders',
          'invoice',
          'originalPayment',
          'refundData',
          'bankDeposit',
        ],
      });

      await trx.raw(
        `
                    update ??.invoices i
                    set balance = balance + p.amount, updated_at = now()
                    from ??.payment_applications p
                    where p.payment_id = ? and p.invoice_id = i.id
                `,
        [schemaName, schemaName, id],
      );
      await trx.raw(
        `
                    update ??.finance_charges f
                    set balance = balance + p.amount, updated_at = now()
                    from ??.payment_applications p
                    where p.payment_id = ? and p.invoice_id = f.invoice_id;
                `,
        [schemaName, schemaName, id],
      );

      await this.$relatedQuery('invoices', trx).for(id).unrelate();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (log) {
      // log && this.$log({ id, userId, action: model.logAction.modify });
      payment.$log({
        userId,
        action: model.logAction.create,
        entity: model.logEntity.reversal,
      });

      bankDeposit.$log({
        userId,
        action: bdUpdate ? model.logAction.modify : model.logAction.create,
        entity: model.logEntity.bankDeposits,
      });
    }

    return payment;
  }

  async $updateMemoInfo(
    { memoNote, date, amount, billableItemType, billableItemId },
    { log, userId } = {},
  ) {
    const { constructor: model } = this;
    const trx = await model.startTransaction();
    const { Customer } = model.models;
    const dateString = date instanceof Date ? date.toUTCString() : date;
    let newBalance, payment;

    try {
      newBalance = await Customer.incrementBalance(this.customerId, this.amount - amount, trx);

      payment = await this.$query(trx).patchAndFetch({
        date: dateString,
        memoNote,
        amount,
        billableItemType,
        billableItemId,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log &&
      payment.$log({
        userId,
        action: model.logAction.modify,
        entity: model.logEntity.creditMemo,
      });

    return newBalance;
  }

  static async calculateMultiOrderPaymentAmount(customerId, orders) {
    const { Order } = this.models;
    const orderIds = pluckId(orders);

    const result = await Order.query()
      .findByIds(orderIds)
      .andWhere('customerId', customerId)
      .select(
        this.raw('coalesce(sum(grand_total) - sum(captured_total), 0) as diff'),
        this.raw('coalesce(count(*), 0) as count'),
      )
      .first();

    if (!result || !result.diff) {
      throw ApplicationError.invalidRequest(`Orders ${orderIds.join(', ')} do not exist`);
    }

    if (result.count < orderIds.length) {
      throw ApplicationError.invalidRequest(
        `Some of the orders do not belong to customer ${customerId}`,
      );
    }

    const { diff } = result;

    return Number(diff) || 0;
  }

  static async createMultiOrderPayment(
    ctx,
    { paymentData, businessUnitId, orders },
    { log, userId } = {},
  ) {
    const { BankDeposit, Order, OrderPaymentHistory } = this.models;
    const orderIds = pluckId(orders);
    const inludeBd = shouldBeIncludedInBankDeposit(paymentData.paymentType);
    let payment, bankDeposit, bdUpdate;

    const trx = await this.startTransaction();

    try {
      const affectedOrders = await Order.query(trx)
        .findByIds(orderIds)
        .select('id', this.raw('grand_total - captured_total as assigned_amount'));

      if (inludeBd) {
        ({ bankDeposit, update: bdUpdate } = await BankDeposit.upsertAndFetchCurrentDeposit(
          {
            condition: {
              businessUnitId,
              type: BankDepositType.CASH_CHECK,
            },
            data: { count: 1, total: paymentData.amount },
          },
          trx,
        ));
      }

      payment = await this.query(trx).insertGraphAndFetch(
        {
          ...paymentData,

          userId,
          appliedAmount: 0,
          sendReceipt: false,
          orders: affectedOrders,
          bankDeposit: bankDeposit ? { id: bankDeposit.id } : undefined,
        },
        {
          relate: ['orders', 'creditCard', 'bankDeposit'],
          insertMissing: ['creditCard'],
          noUpdate: ['creditCard', 'orders', 'bankDeposit'],
        },
      );

      await Order.query(trx)
        .patch({ capturedTotal: Order.ref('grandTotal') })
        .findByIds(orderIds);

      await OrderPaymentHistory.logCreatedMultiPayment(payment.id, userId, trx);

      await updateOrdersPaymentMethods(ctx, {
        schemaName: this.schemaName,
        orderIds,
        paymentMethod: paymentData.paymentType,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (log) {
      payment.$log({ userId, action: this.logAction.create });

      if (inludeBd) {
        bankDeposit.$log({
          userId,
          action: bdUpdate ? this.logAction.modify : this.logAction.create,
          entity: this.logEntity.bankDeposits,
        });
      }
    }

    return payment;
  }

  static async getPaymentsReceiptData(orderIds) {
    const { Order } = this.models;

    const items = await Order.relatedQuery('payments')
      .for(orderIds)
      .withGraphFetched('[customer,creditCard,orders.[lineItems,jobSite]]');

    return items;
  }

  static async addReceiptUrls(
    { receiptPreviewUrl, receiptPdfUrl, orderId, paymentId },
    { log, userId } = {},
  ) {
    const trx = this.knex();

    const payments = await trx('ordersPayments')
      .withSchema(this.schemaName)
      .where({ paymentId, orderId })
      .update({ receiptPdfUrl, receiptPreviewUrl }, ['id']);

    if (log && payments?.length) {
      const action = this.logAction.modify;
      payments.forEach(payment => payment.$log({ userId, action }));
    }
  }

  async $refundUpdate(
    { refundedAmount, orderId, onAccountPayment, checkNumber, refundType } = {},
    { logOrderHistory = true, log, userId } = {},
  ) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    let payment;
    const update = {};
    try {
      if (refundType === RefundType.ON_ACCOUNT) {
        update.refundedOnAccountAmount = trx.raw('?? + ?', [
          'refundedOnAccountAmount',
          refundedAmount,
        ]);
      } else {
        update.refundedAmount = trx.raw('?? + ?', ['refundedAmount', refundedAmount]);
      }

      payment = await this.$query(trx).patchAndFetch(update);

      const { id: paymentId } = this;
      const { schemaName } = this.constructor;

      await trx('refundPayments').withSchema(schemaName).insert({
        paymentId,
        onAccountPaymentId: onAccountPayment?.id,
        amount: refundedAmount,
        checkNumber,
        type: refundType,
      });

      if (orderId) {
        const orders = await trx('ordersPayments')
          .withSchema(schemaName)
          .decrement('assignedAmount', refundedAmount)
          .where({ paymentId, orderId })
          .returning(['orders_payments.orderId as orderId', 'assignedAmount']);

        if (logOrderHistory) {
          const paymentData = {
            ...payment,

            orders,

            onAccountPaymentId: onAccountPayment?.id,
            refundAmount: refundedAmount,
            refundCheckNumber: checkNumber,
            refundType,
          };

          await OrderPaymentHistory.logPrepaidPaymentRefund(paymentId, paymentData, userId, trx);
        }
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && payment.$log({ userId, action: this.constructor.logAction.modify });

    return payment;
  }

  async $updateOnCapture({ amount, ccRetref, orders }, { log, userId } = {}) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    try {
      const updates = { amount, ccRetref, status: PaymentStatus.CAPTURED };
      await this.$query(trx).patch(updates);

      const { schemaName } = this.constructor;
      const paymentId = this.id;
      await trx('ordersPayments').withSchema(schemaName).where({ paymentId }).delete();

      await trx('ordersPayments')
        .withSchema(schemaName)
        .insert(
          orders.map(({ id: orderId, assignedAmount }) => ({
            orderId,
            paymentId,
            assignedAmount,
          })),
        );

      Object.assign(updates, { orders, userId });
      await OrderPaymentHistory.logCapturedPayment(paymentId, updates, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    log && this.$log({ userId, action: this.constructor.logAction.modify });
  }

  async $updateOnVoid({ orders }, { log, userId } = {}) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    try {
      const updates = { status: PaymentStatus.VOIDED };
      await this.$query(trx).patch(updates);

      Object.assign(updates, { orders, userId });
      await OrderPaymentHistory.logVoidedPayment(this.id, updates, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    log && this.$log({ userId, action: this.constructor.logAction.modify });
  }

  static async getByOrderId({ orderId, condition = {} }) {
    const { Order } = this.models;

    const item = await Order.relatedQuery('payments').for(orderId).where(condition).first();

    return item;
  }

  static async getAllForRefund({ orderId }) {
    const { Order } = this.models;

    const item = await Order.relatedQuery('payments')
      .for(orderId)
      .where({ status: PaymentStatus.CAPTURED })
      .withGraphFetched('creditCard');

    return item;
  }

  static async getById(id) {
    const { BankDeposit } = this.models;

    const bdQueryAlias = 'bank_deposit_query';

    const query = this.query().leftJoin(
      BankDeposit.query()
        .select([BankDeposit.ref('id'), BankDeposit.ref('date'), 'bankDepositPayment.paymentId'])
        .innerJoin('bankDepositPayment', 'bankDepositPayment.bankDepositId', BankDeposit.ref('id'))
        .where(BankDeposit.ref('depositType'), '!=', BankDepositType.REVERSAL)
        .as(bdQueryAlias),
      `${bdQueryAlias}.paymentId`,
      this.ref('id'),
    );

    const item = await query
      .select(`${this.tableName}.*`, `${bdQueryAlias}.date as bankDepositDate`)
      .findById(id);

    return item;
  }

  static async getByIdWithCustomer(id) {
    const item = await this.query().withGraphFetched('customer').findById(id);
    return item;
  }

  static async getByIdForCharge(id) {
    const item = await this.query()
      .withGraphFetched('[customer,creditCard,orders.[lineItems,jobSite]]')
      .findById(id);
    return item;
  }

  static async getByIdsForCharge(ids) {
    const items = await this.query()
      .withGraphFetched('[customer,creditCard,orders.[lineItems,jobSite]]')
      .findByIds(ids);
    return items;
  }

  static async getByIdForRefund(id) {
    const item = await this.query()
      .withGraphJoined('[orders,customer.businessUnit,creditCard]')
      .findById(id);

    return item;
  }

  async $updateAssignedAmount({ orderId, amount }, userId) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    try {
      const { id: paymentId } = this;
      const result = await trx('ordersPayments')
        .withSchema(this.constructor.schemaName)
        .where({ paymentId, orderId })
        .update('assignedAmount', trx.raw('?? + ?', ['assignedAmount', mathRound2(amount)]))
        .returning('assignedAmount');

      const assignedAmount = Array.isArray(result) ? result[0] : result;
      await OrderPaymentHistory.logTargetUpdate(
        {
          paymentId,
          orderId,
          assignedAmount: Number(assignedAmount) || 0,
        },
        userId,
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async $updateChargedDeferredPayment(ctx, { data, orderIds, userId }, { log } = {}) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    let payment;
    try {
      payment = await this.$query(trx).patchAndFetch(data);

      if (data.status === PaymentStatus.CAPTURED && !data.deferredUntil) {
        await OrderPaymentHistory.logChargedDeferredPayment(payment.id, userId, trx);

        await Promise.all(
          orderIds.map(id =>
            dispatchOrders(ctx, {
              schemaName: this.constructor.schemaName,
              userId,
              orderId: id,
            }),
          ),
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.$log({ userId, action: this.constructor.logAction.modify });

    return payment;
  }

  async $updateUndeferedPayment(ctx, { orderId, nonCanceledOrders = [] }, { log, userId } = {}) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    let payment;
    try {
      let updateData = { deferredUntil: null, canceled: true };
      if (nonCanceledOrders?.length) {
        updateData = {
          amount: nonCanceledOrders.reduce(
            (sum, currentOrder) => sum + +currentOrder.grandTotal,
            0,
          ),
        };
      }
      payment = await this.$query(trx).patchAndFetch(updateData);
      await OrderPaymentHistory.logUndeferredPayment(payment.id, userId, trx);

      await dispatchOrders(ctx, { schemaName: this.constructor.schemaName, userId, orderId });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.$log({ userId, action: this.constructor.logAction.modify });

    return payment;
  }

  async $updatedDeferred(updates, orders, userId) {
    const { OrderPaymentHistory } = this.constructor.models;
    const trx = await this.constructor.startTransaction();

    try {
      await this.$query(trx).patch(updates);

      await OrderPaymentHistory.logUpdatedDeferredPayment(
        this.id,
        {
          ...updates,
          orders,
          userId,
        },
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  $shouldChargeImmediately({ paymentType, newCreditCard, creditCardId }) {
    const isCreditCard = this.paymentType === PaymentType.CREDIT_CARD;

    const changedCreditCard =
      isCreditCard && (newCreditCard || String(this.creditCard.id) !== String(creditCardId));

    return (
      !this.canceled &&
      ((this.status === PaymentStatus.FAILED && this.deferredUntil && changedCreditCard) ||
        [PaymentType.CHECK, PaymentType.CASH].includes(paymentType))
    );
  }

  $shouldUpdateDeferredInfo() {
    return !this.canceled && this.status === PaymentStatus.DEFERRED && this.deferredUntil;
  }

  static async getQBData({ condition: { rangeFrom, rangeTo, customerIds } = {} }) {
    const trx = this.knex();
    let query = this.query(trx).select([
      this.raw(`${this.tableName}.id paymentId`),
      this.raw(`${this.tableName}.customer_id customerId`),
      this.raw(`${this.tableName}.amount paymentTotal`),
      this.raw(`${this.tableName}.payment_type paymentType`),
    ]);

    query = query.andWhere(`${this.tableName}.invoiced_status`, '!=', 'reversed');

    if (rangeFrom) {
      query = query.andWhere(`${this.tableName}.createdAt`, '>', rangeFrom);
    }

    if (rangeTo) {
      query = query.andWhere(`${this.tableName}.createdAt`, '<=', rangeTo);
    }

    if (customerIds?.length) {
      query = query.whereIn(`${this.tableName}.customerId`, customerIds);
    }

    query = query.orderBy(`${this.tableName}.id`);
    return query;
  }

  static async applyPayout(applications, trx, { log, userId } = {}) {
    await this.query(trx).upsertGraph(applications, {
      noDelete: true,
      relate: ['creditCard'],
      noUpdate: ['customer', 'order', 'invoice'],
    });

    if (log) {
      const action = this.logAction.modify;
      applications.forEach(({ id }) => this.log({ id, userId, action }), this);
    }
  }

  static async deleteCreditMemo(id, { log, userId } = {}) {
    await super.deleteById(id);

    log &&
      this.log({
        id,
        userId,
        action: this.logAction.delete,
        entity: this.logEntity.creditMemo,
      });
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched(
        '[customer,businessUnit,creditCard,orders,invoices,refundData,originalPayment,reverseData]',
      );

    return item ? super.castNumbers(item) : null;
  }

  static async getDeferredByCustomer(customerId) {
    return this.query()
      .where('customerId', customerId)
      .andWhere('status', PaymentStatus.DEFERRED)
      .whereNotNull('deferredUntil')
      .select('*');
  }
}
