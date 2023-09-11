import * as dateFns from 'date-fns';

import ApplicationError from '../errors/ApplicationError.js';

import { generateAndSaveInvoiceBySession } from '../services/reporting/report.js';
import {
  updateCustomerBalance,
  rollbackFailedToInvoiceOrders,
  informAboutInvoicedOrders,
} from '../services/core.js';

import { mathRound2 } from '../utils/math.js';
import { prepareSubscriptions } from '../utils/processSubscriptionInvoice.js';

import { pricingGetSubscriptionServiceItemById } from '../services/pricing.js';

import { PaymentTerms } from '../consts/paymentTerms.js';
import { InvoiceSorting } from '../consts/invoiceSorting.js';
import { InvoiceConstruction } from '../consts/invoiceConstructions.js';
import { PaymentMethod } from '../consts/paymentMethod.js';
import { InvoiceType } from '../consts/invoiceTypes.js';
import { DEFAULT_WRITE_OFF_DIFFERENCE_IN_HOURS } from '../consts/defaults.js';
import { CustomerType } from '../consts/customerType.js';
import { InvoiceStatus } from '../consts/invoiceStatus.js';
import { InvoiceAge } from '../consts/invoiceAge.js';
import { dbAliases } from '../consts/dbAliases.js';
import { SubChildEntity } from '../consts/subscriptionEntity.js';
import { AUTO_PAY_TYPES } from '../consts/customerAutoPayTypes.js';
import { BUSINESS_UNIT_TYPE } from '../consts/businessUnitTypes.js';

import { WRITE_OFF_DIFFERENCE_IN_HOURS } from '../config.js';
import { SortOrder } from '../consts/sortOrders.js';
import FinanceCharge from './financeCharge.js';
import BaseModel from './_base.js';

const mapOrdersAsInvoiceInput = (orders, customerId) => {
  const prepaidOrderIds = [];
  let mappedOrders = [];

  mappedOrders =
    orders.map(order => {
      const orderJsId = order.jobSite.id;

      if (order.paymentMethod !== PaymentMethod.ON_ACCOUNT) {
        prepaidOrderIds.push(order.id);
      }

      const { ticketFile } = order;
      delete order.ticketFile;

      return {
        ...order,
        jobSite: { id: orderJsId },
        jobSiteId: Number(orderJsId),
        customerId,
        services: undefined,
        customerJobSite: { id: order.customerJobSite.id },
        customerJobSiteId: Number(order.customerJobSite.id),
        lineItems: order.services
          .filter(service => {
            if (service.description) {
              return service;
            }
            return null;
          })
          .map(service => ({
            ...service,
            total: mathRound2(service.price * service.quantity),
          })),
        ticketUrl: ticketFile ? ticketFile.url : undefined,
        mediaFiles:
          order.mediaFiles?.map(file => ({
            fileName: file.fileName,
            url: file.url,
            orderId: order.id,
          })) ?? [],
      };
    }) || [];
  return { mappedOrders, prepaidOrderIds };
};

export default class Invoice extends BaseModel {
  static get tableName() {
    return 'invoices';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['csrEmail', 'total', 'balance', 'userId'],

      properties: {
        id: { type: 'integer' },
        dueDate: { type: ['string', null] },

        csrEmail: { type: 'string', format: 'email' },
        csrName: { type: 'string' },
        pdfUrl: { type: 'string' },
        previewUrl: { type: 'string' },

        type: { type: 'string' },

        total: { type: 'number' },
        balance: { type: 'number' },

        customerId: { type: 'integer' },
        // TODO: shortcut-hack
        jobSiteOriginalId: { type: ['integer', null] },
        userId: { type: 'string' },
        autopayType: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const {
      Order,
      Subscription,
      Customer,
      Payment,
      BusinessUnit,
      InvoiceEmail,
      InvoiceAttachments,
      GenerationJob,
      SubscriptionInvoice,
    } = this.models;
    return {
      orders: {
        relation: BaseModel.HasManyRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.id`,
          to: `${Order.tableName}.invoiceId`,
        },
      },
      subscriptions: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Subscription,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'subscriptionsInvoices.invoiceId',
            to: 'subscriptionsInvoices.subscriptionId',
            extra: ['nextBillingPeriodFrom', 'nextBillingPeriodTo', 'totalPriceForSubscription'],
          },
          to: `${Subscription.tableName}.id`,
        },
      },

      subscriptionInvoice: {
        relation: BaseModel.HasManyRelation,
        modelClass: SubscriptionInvoice,
        join: {
          from: `${this.tableName}.id`,
          to: `${SubscriptionInvoice.tableName}.invoiceId`,
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
      payments: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'paymentApplications.invoiceId',
            to: 'paymentApplications.paymentId',
            extra: ['amount', 'prevBalance'],
          },
          to: `${Payment.tableName}.id`,
        },
      },
      emails: {
        relation: BaseModel.HasManyRelation,
        modelClass: InvoiceEmail,
        join: {
          from: `${this.tableName}.id`,
          to: `${InvoiceEmail.tableName}.invoiceId`,
        },
      },
      invoiceAttachments: {
        relation: BaseModel.HasManyRelation,
        modelClass: InvoiceAttachments,
        join: {
          from: `${this.tableName}.id`,
          to: `${InvoiceAttachments.tableName}.invoiceId`,
        },
      },
      generationJob: {
        relation: BaseModel.HasOneThroughRelation,
        modelClass: GenerationJob,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'invoiceGenerationJob.invoiceId',
            to: 'invoiceGenerationJob.generationJobId',
          },
          to: `${GenerationJob.tableName}.id`,
        },
      },
    };
  }

  static calculateDueDate(createdDate, paymentTerms) {
    let result;
    switch (paymentTerms) {
      case PaymentTerms.COD: {
        result = createdDate;
        break;
      }
      case PaymentTerms.NET_15_DAYS: {
        result = dateFns.addDays(createdDate, 15);
        break;
      }
      case PaymentTerms.NET_30_DAYS: {
        result = dateFns.addDays(createdDate, 30);
        break;
      }
      case PaymentTerms.NET_60_DAYS: {
        result = dateFns.addDays(createdDate, 60);
        break;
      }
      default: {
        result = createdDate;
        break;
      }
    }
    return result;
  }

  static async generate(
    ctx,
    {
      customer,
      orders,
      subscriptions,
      generationJob,
      attachMediaPref,
      attachTicketPref,
      businessUnitId,
      businessUnitType,
      ...invoice
    },
    { subscriberName, schemaName, exagoSessionId, userId, customInvoice },
    { currentDate = new Date(), log },
  ) {
    const { Customer, Order, Payment } = this.models;
    const { id: customerId, isAutopayExist, autopayType } = customer;
    const { csrEmail, csrName } = invoice;
    const orderIds = orders.map(({ id }) => id);
    let generatedInvoice, balance, updatedPaymentIds;
    const { prepaidOrderIds, mappedOrders } = mapOrdersAsInvoiceInput(orders, customerId);
    const isSubscription = subscriptions?.length;
    const trxInsert = await this.startTransaction();
    try {
      const capturedTotal = await Order.getTotalPaidAmount(prepaidOrderIds, trxInsert);
      balance = mathRound2(invoice.total - capturedTotal);

      if (
        customer.invoiceConstruction === InvoiceConstruction.BY_ADDRESS ||
        customer.invoiceConstruction === InvoiceConstruction.BY_ORDER
      ) {
        invoice.jobSiteOriginalId = orders[0]?.jobSite?.id || subscriptions[0]?.jobSite?.id;
      }

      if (prepaidOrderIds.length > 0) {
        const isFullyCaptured = await Order.isFullyCaptured(prepaidOrderIds, trxInsert);

        if (!isFullyCaptured) {
          await generationJob.$incrementFailedCount();
          return null;
        }
      }

      const subRes = await prepareSubscriptions({ subscriptions, customerId: customer.id }, ctx);

      const invoiceType = mappedOrders.length ? InvoiceType.ORDERS : InvoiceType.SUBSCRIPTIONS;

      const dataToInsert = {
        data: {
          ...invoice,
          autopayType: isAutopayExist ? autopayType : null,
          csrName,
          csrEmail,
          userId,
          dueDate: Invoice.calculateDueDate(currentDate, customer.paymentTerms).toUTCString(),
          customer: {
            id: customerId,
          },
          type: invoiceType,
          ...(mappedOrders.length ? { orders: mappedOrders } : {}),
          ...(isSubscription
            ? {
                subscriptions: subRes.subscriptions,
                subscriptionInvoice: null,
              }
            : {}),
          balance,
        },
      };

      generatedInvoice = await this.createOne(dataToInsert, trxInsert, ctx);

      if (isSubscription) {
        await this.processedSubChildItems({ generatedInvoice, subRes }, trxInsert);
      }

      await trxInsert.commit();

      if (!generatedInvoice) {
        throw new Error('Missed newly generated invoice');
      }

      const { id } = generatedInvoice;
      let trxUpdate;

      const getFileInfo = await generateAndSaveInvoiceBySession(
        invoiceType,
        ctx,
        exagoSessionId,
        subscriberName,
        id,
        customInvoice ? schemaName : '',
      );

      try {
        trxUpdate = await this.startTransaction();
        if (getFileInfo.pdfUrl) {
          await this.patchById(id, { pdfUrl: getFileInfo.pdfUrl }, trxUpdate);
          generatedInvoice.pdfUrl = getFileInfo.pdfUrl;
        }

        const newBalance = await Customer.incrementBalance(customerId, balance, trxUpdate);

        if (prepaidOrderIds.length) {
          updatedPaymentIds = await Payment.applyToInvoicesAutomatically(
            {
              orderIds: prepaidOrderIds,
              userId,
            },
            trxUpdate,
            { log, userId },
          );
        }

        updateCustomerBalance(ctx, {
          schemaName,
          userId,
          customerId,
          newBalance,
        });

        await Promise.all([
          generationJob.$incrementCount(trxUpdate),
          generationJob.$relateInvoice(id, trxUpdate),
        ]);

        await trxUpdate.commit();
      } catch (error) {
        ctx.logger.error(error, 'Failed post invoice creation actions');

        if (trxUpdate) {
          await trxUpdate.rollback();
        }
        // re-throw error to revert data in core
        throw error;
      }
    } catch (error) {
      ctx.logger.error(error, 'Failed to generate invoice');

      if (!trxInsert.isCompleted()) {
        await trxInsert.rollback();
      }
      const reverts = [
        generationJob.$incrementFailedCount(),
        rollbackFailedToInvoiceOrders(ctx, { schemaName, orderIds, userId }),
      ];
      if (generatedInvoice?.id) {
        // no need to log it since it happens later
        reverts.push(this.deleteById(generatedInvoice.id));
      }
      await Promise.allSettled(reverts);
      return null;
    }

    if (generatedInvoice && businessUnitType === BUSINESS_UNIT_TYPE.RECYCLING_FACILITY) {
      informAboutInvoicedOrders(ctx, { schemaName, orderIds, customerId, businessUnitId, userId });
    }
    if (log && generatedInvoice) {
      generatedInvoice.$log({ userId, action: this.logAction.create });

      const common = {
        userId,
        action: this.logAction.modify,
        entity: this.logEntity.payments,
      };
      updatedPaymentIds?.forEach(id => this.log({ id, ...common }), this);
    }

    Object.assign(generatedInvoice, {
      attachMediaPref,
      attachTicketPref,
    });
    Object.assign(generatedInvoice.customer, {
      brokerEmail: customer?.brokerEmail,
    });
    return generatedInvoice;
  }

  static async createOne({ data }, trx) {
    const invoice = await this.query(trx).upsertGraphAndFetch(data, {
      noDelete: [
        'customer',
        'payments',
        'orders',
        'orders.jobSite',
        'orders.customer',
        'orders.customerJobSite',
      ],
      insertMissing: [
        'orders',
        'orders.lineItems',
        'orders.mediaFiles',
        'subscriptions',
        'subscriptions.mediaFiles',
        'generationJob',
      ],
      relate: [
        'customer',
        'orders',
        'orders.jobSite',
        'subscriptions.jobSite',
        'orders.customer',
        'orders.customerJobSite',
        'generationJob',
        'subscriptions',
        'subscriptionInvoice',
      ],
    });
    return invoice;
  }

  // TODO: unsed?
  static async deleteInvoices(invoices) {
    const ids = invoices.map(({ id }) => id);

    const trx = await this.startTransaction();
    try {
      await this.relatedQuery('orders', trx).for(ids).unrelate();
      await this.relatedQuery('generationJob', trx).for(ids).unrelate();
      await this.query(trx).delete().whereIn('id', ids);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async deleteById(id, { log, userId } = {}) {
    const trx = await this.startTransaction();
    try {
      await this.relatedQuery('orders', trx).for(id).unrelate();
      await this.relatedQuery('generationJob', trx).for(id).unrelate();

      await this.query(trx).findById(id).delete();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, userId, action: this.logAction.delete });
  }

  static async getAllPaginated({
    condition: {
      businessUnitId,
      subscriptionId,
      customerIds,
      jobSiteId,
      searchId,
      searchQuery,
      filters,
    } = {},
    limit,
    offset,
    sortBy = InvoiceSorting.ID,
    sortOrder = SortOrder.DESC,
    includeCustomer = false,
  } = {}) {
    const { Customer, Order, InvoiceEmail } = this.models;

    let query = customerIds ? Customer.relatedQuery('invoices').for(customerIds) : this.query();
    query = query.select([
      `${this.tableName}.*`,
      `${FinanceCharge.tableName}.id as financeChargeId`,
    ]);

    const customerAlias = dbAliases[Customer.tableName];

    if (
      businessUnitId ||
      filters?.filterByCustomer?.length ||
      sortBy === InvoiceSorting.CUSTOMER_NAME ||
      sortBy === InvoiceSorting.CUSTOMER_TYPE ||
      searchQuery?.length >= 3
    ) {
      query = query.joinRelated('customer', { alias: customerAlias });
    }

    if (businessUnitId) {
      query = query.andWhere(`${customerAlias}.businessUnitId`, businessUnitId);
    }

    if (searchId) {
      query = query.leftJoinRelated('orders', { alias: dbAliases[Order.tableName] });
    }

    if (searchQuery) {
      query = query.leftJoinRelated('emails', { alias: dbAliases[InvoiceEmail.tableName] });
    }

    query = query.leftJoin(
      FinanceCharge.tableName,
      `${FinanceCharge.tableName}.invoice_id`,
      `${this.tableName}.id`,
    );

    query = this.applySearchToQuery(query, { searchId, searchQuery });
    query = this.applyFiltersToQuery(query, { ...filters, jobSiteId, subscriptionId });

    switch (sortBy) {
      case InvoiceSorting.ID:
      case InvoiceSorting.CREATED_AT:
      case InvoiceSorting.DUE_DATE:
      case InvoiceSorting.TOTAL:
      case InvoiceSorting.BALANCE: {
        query = query.orderBy(Invoice.ref(sortBy), sortOrder);
        break;
      }
      case InvoiceSorting.CUSTOMER_NAME: {
        query = query.orderBy(`${customerAlias}.name`, sortOrder).groupBy(`${customerAlias}.name`);
        break;
      }
      case InvoiceSorting.CUSTOMER_TYPE: {
        query = query
          .orderBy(`${customerAlias}.onAccount`, sortOrder)
          .groupBy(`${customerAlias}.onAccount`);
        break;
      }
      case InvoiceSorting.STATUS: {
        query = query.orderByRaw(
          `case
                    when invoices.balance > 0 and due_date < CURRENT_DATE then 3
                    when invoices.write_off = true then 4
                    when invoices.balance = 0 then 1
                    else 2
                    end ${sortOrder}`,
        );
        break;
      }
      default:
    }

    if (includeCustomer) {
      query = query.withGraphFetched('customer');
    }

    query = query
      .limit(limit)
      .offset(offset)
      .groupBy([Invoice.ref('id'), FinanceCharge.ref('id')]);

    const result = await query;
    return result;
  }

  static applySearchToQuery(originalQuery, { searchId, searchQuery }) {
    const { Order, Customer, InvoiceEmail } = this.models;
    let query = originalQuery;

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
        builder.orWhere(`${dbAliases[Order.tableName]}.id`, searchId);
        builder.orWhere(`${dbAliases[Order.tableName]}.woNumber`, searchId);
      }

      if (searchQuery) {
        builder.orWhere(`${dbAliases[InvoiceEmail.tableName]}.receiver`, searchQuery);
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
      jobSiteId,
      canWriteOff = false,
      filterByType = [InvoiceType.ORDERS, InvoiceType.SUBSCRIPTIONS],
      filterByStatus,
      filterByAge,
      filterByCustomer,
      filterByDueDateFrom,
      filterByDueDateTo,
      filterByCreatedFrom,
      filterByCreatedTo,
      filterByAmountFrom,
      filterByAmountTo,
      filterByBalanceFrom,
      filterByBalanceTo,
      filterByUser,
      filterBusinessLineIds,
      subscriptionId,
    } = {},
  ) {
    const { Customer, Order, Subscription } = this.models;
    let query = originalQuery;

    if (jobSiteId) {
      query = query.andWhere('jobSiteOriginalId', jobSiteId);
    }

    if (canWriteOff) {
      query = query.andWhere(
        Invoice.ref('dueDate'),
        '<=',
        dateFns.subHours(
          new Date(),
          WRITE_OFF_DIFFERENCE_IN_HOURS || DEFAULT_WRITE_OFF_DIFFERENCE_IN_HOURS,
        ),
      );
    }

    if (filterByType.length) {
      query = query.whereIn(`${this.tableName}.type`, filterByType);
    }

    if (filterByCustomer?.length) {
      query = query.andWhere(builder => {
        if (filterByCustomer.includes(CustomerType.ON_ACCOUNT)) {
          builder.orWhere(`${dbAliases[Customer.tableName]}.onAccount`, true);
        }

        if (filterByCustomer.includes(CustomerType.PREPAID)) {
          builder.orWhere(`${dbAliases[Customer.tableName]}.onAccount`, false);
        }

        return builder;
      });
    }

    if (filterByStatus?.length || filterByAge?.length) {
      query = this.applyInvoiceStatusFilter(query, { filterByStatus, filterByAge });
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

    if (filterByDueDateFrom) {
      query = query.andWhere(this.ref('dueDate'), '>=', filterByDueDateFrom);
    }

    if (filterByDueDateTo) {
      query = query.andWhere(this.ref('dueDate'), '<=', filterByDueDateTo);
    }

    if (typeof filterByAmountFrom === 'number') {
      query = query.andWhere(this.ref('total'), '>=', filterByAmountFrom);
    }

    if (typeof filterByAmountTo === 'number') {
      query = query.andWhere(this.ref('total'), '<=', filterByAmountTo);
    }

    if (typeof filterByBalanceFrom === 'number') {
      query = query.andWhere(this.ref('balance'), '>=', filterByBalanceFrom);
    }

    if (typeof filterByBalanceTo === 'number') {
      query = query.andWhere(this.ref('balance'), '<=', filterByBalanceTo);
    }

    if (filterBusinessLineIds?.length) {
      query = query
        .joinRelated('orders', { alias: dbAliases[Order.tableName] })
        .whereIn(`${dbAliases[Order.tableName]}.businessLineId`, filterBusinessLineIds);
    }

    if (subscriptionId) {
      query = query
        .joinRelated('subscriptions', {
          alias: dbAliases[Subscription.tableName],
        })
        .andWhere(`${dbAliases[Subscription.tableName]}.id`, subscriptionId);
    }

    return query;
  }

  static applyInvoiceStatusFilter(query, { filterByStatus = [], filterByAge = [] } = {}) {
    return query.andWhere(builder => {
      if (filterByStatus.includes(InvoiceStatus.WRITE_OFF)) {
        builder.orWhere(this.ref('writeOff'), true);
      }

      if (filterByStatus.includes(InvoiceStatus.CLOSED)) {
        builder.orWhere(qb =>
          qb.where(this.ref('balance'), 0).andWhere(this.ref('writeOff'), false),
        );
      }

      if (filterByStatus.includes(InvoiceStatus.OPEN)) {
        builder.orWhere(qb =>
          qb
            .where(this.ref('balance'), '>', 0)
            .andWhere(q => q.whereRaw('due_date >= CURRENT_DATE').orWhereNull(this.ref('dueDate')))
            .andWhere(this.ref('writeOff'), false),
        );
      }

      if (filterByStatus.includes(InvoiceStatus.OVERDUE) || filterByAge.length) {
        builder.orWhere(qb => {
          qb.where(this.ref('balance'), '>', 0).andWhereRaw('due_date < CURRENT_DATE');

          if (filterByAge.length) {
            qb.andWhere(overdueQb => {
              if (filterByAge.includes(InvoiceAge.CURRENT)) {
                overdueQb.orWhereRaw('(CURRENT_DATE - due_date) <= 30');
              }

              if (filterByAge.includes(InvoiceAge.OVERDUE_31_DAYS)) {
                overdueQb.orWhereRaw(`((CURRENT_DATE - due_date) >= 31
                        and (CURRENT_DATE - due_date) <= 60)`);
              }

              if (filterByAge.includes(InvoiceAge.OVERDUE_61_DAYS)) {
                overdueQb.orWhereRaw(`((CURRENT_DATE - due_date) >= 61
                        and (CURRENT_DATE - due_date) <= 90)`);
              }

              if (filterByAge.includes(InvoiceAge.OVERDUE_91_DAYS)) {
                overdueQb.orWhereRaw('(CURRENT_DATE - due_date) >= 91');
              }

              return overdueQb;
            });
          }

          return qb;
        });
      }

      return builder;
    });
  }

  static async getInvoiceWithCustomer(id, { openOnly = false, businessUnitId } = {}) {
    let query = this.query().findById(id).withGraphJoined('customer');

    if (openOnly) {
      query = query.where(Invoice.ref('balance'), '>', 0);
    }
    if (businessUnitId) {
      query = query.andWhere('customer.businessUnitId', businessUnitId);
    }

    const item = await query;

    return item;
  }

  static async getAllCreatedInRange({
    customerId,
    from,
    to,
    fields = ['*'],
    types = [InvoiceType.ORDERS],
  } = {}) {
    const items = await this.query()
      .where({ customerId })
      .whereIn('type', types)
      .andWhere('createdAt', '<=', to)
      .andWhere('createdAt', '>=', from)
      .select(fields);
    return items;
  }

  static async getAllUpdatedInRange({ customerId, from, to, types = [InvoiceType.ORDERS] } = {}) {
    const trx = this.knex();

    const items = await this.query()
      .where({ customerId })
      .whereIn('type', types)
      .andWhere(`${this.tableName}.createdAt`, '<', from)
      .andWhere(qb =>
        qb
          .where('balance', '>', 0)
          .orWhereExists(
            trx('paymentApplications')
              .withSchema(this.schemaName)
              .whereRaw('invoice_id = invoices.id')
              .andWhereRaw('created_at >= ? and created_at <= ?', [from, to])
              .select(1),
          ),
      )
      .select(`${this.tableName}.*`);
    return items;
  }

  static async getInvoicesForMailing(invoiceIds) {
    const items = await this.query()
      .withGraphFetched(
        '[customer, orders.[mediaFiles, customerJobSite], subscriptions, invoiceAttachments]',
      )
      .whereIn(Invoice.ref('id'), invoiceIds);

    return items;
  }

  static async getInvoiceWithAttachments(invoiceId) {
    const items = await this.query()
      .withGraphFetched('[orders.mediaFiles, subscriptions, invoiceAttachments]')
      .where({ id: invoiceId })
      .first();

    return items;
  }

  static async countAll({
    businessUnitId,
    customerId,
    subscriptionId,
    jobSiteId,
    filters,
    searchId,
    searchQuery,
  }) {
    const { Customer, Order, InvoiceEmail } = this.models;

    let query = customerId ? Customer.relatedQuery('invoices').for(customerId) : this.query();

    query = query.countDistinct(`${this.tableName}.id as count`);

    const customerAlias = dbAliases[Customer.tableName];

    if (businessUnitId || filters?.filterByCustomer?.length || searchQuery?.length >= 3) {
      query = query.joinRelated('customer', { alias: customerAlias });

      if (businessUnitId) {
        query = query.andWhere(`${customerAlias}.businessUnitId`, businessUnitId);
      }
    }

    if (jobSiteId) {
      query = query.andWhere('jobSiteOriginalId', jobSiteId);
    }

    if (filters?.filterBusinessLineIds?.length) {
      query = query
        .joinRelated('orders', { alias: dbAliases[Order.tableName] })
        .whereIn(`${dbAliases[Order.tableName]}.businessLineId`, filters.filterBusinessLineIds);
    }

    if (searchId) {
      query = query.leftJoinRelated('orders', { alias: dbAliases[Order.tableName] });
    }

    if (searchQuery) {
      query = query.leftJoinRelated('emails', { alias: dbAliases[InvoiceEmail.tableName] });
    }

    query = this.applySearchToQuery(query, { searchId, searchQuery });
    query = this.applyFiltersToQuery(query, { ...filters, subscriptionId });

    const result = await query;

    const count = result.length ? result[0].count : 0;

    return Number(count);
  }

  // TODO: unsed?
  static async addFileUrls(invoiceId, { previewUrl, pdfUrl }, trx) {
    await this.patchById(invoiceId, { previewUrl, pdfUrl }, trx);
  }

  static async getPdfUrls(invoiceIds) {
    const result = await this.query()
      .findByIds(invoiceIds)
      .select(['pdfUrl', 'createdAt'])
      .orderBy('id');

    return result;
  }

  static async addWriteOff(invoiceIds, { log, userId } = {}) {
    await this.query().patch({ writeOff: true }).whereIn('id', invoiceIds);

    log && invoiceIds.forEach(id => this.log({ id, userId, action: this.logAction.modify }), this);
  }

  static async getForFinanceCharges(statementIds, minTotal) {
    const trx = this.knex();

    const invoices = await this.query(trx)
      .withGraphFetched('payments')
      .join('statements_items as si', Invoice.ref('id'), 'si.invoice_id')
      .join('statements as s', 'si.statement_id', 's.id')
      .leftJoin('finance_charges_invoices as fi', Invoice.ref('id'), 'fi.invoice_id')
      .leftJoin('payment_applications as p', builder =>
        builder.on('invoices.id', 'p.invoice_id').andOn('p.createdAt', '<', 's.endDate'),
      )
      .whereIn('statementId', statementIds)
      .andWhere('total', '>', minTotal)
      .andWhere('type', InvoiceType.ORDERS)
      .andWhereRaw(`s.end_date > invoices.due_date`)
      .andWhere(queryBuilder =>
        queryBuilder
          .where(qb => qb.where(Invoice.ref('balance'), '>', 0))
          .orWhereExists(
            trx('paymentApplications as pa')
              .withSchema(this.schemaName)
              .whereRaw('pa.invoice_id = invoices.id')
              .andWhereRaw('pa.created_at > invoices.due_date')
              .select(1),
          ),
      )
      .groupBy([`${this.tableName}.id`, 's.id', 's.endDate'])
      .select([
        `${this.tableName}.*`,
        's.id as statementId',
        's.endDate as endStatementDate',
        trx.raw('coalesce(max(fi.to_date), invoices.due_date) as ??', ['lastChargeDate']),
        trx.raw(
          "coalesce(json_agg(p.* order by p.id) filter (where p.invoice_id is not null), '[]') as ??",
          ['paymentApplications'],
        ),
      ]);

    return invoices;
  }

  static async getByOrderIds(orderIds) {
    const { Order } = this.models;

    return this.query()
      .joinRelated('orders')
      .whereIn(Order.ref('id'), orderIds)
      .select({
        invoiceId: this.ref('id'),
        orderId: Order.ref('id'),
        pdfUrl: this.ref('pdfUrl'),
      });
  }

  static async getBySubOrderId(orderId) {
    const trx = this.knex();

    return this.query(trx)
      .joinRelated('subscriptionInvoice as si')
      .whereExists(
        trx('subscriptionInvoicedEntities')
          .withSchema(this.schemaName)
          .where({ entityId: orderId })
          .andWhereRaw('subscription_invoice_id = si.id')
          .whereIn('type', [
            SubChildEntity.SUBSCRIPTION_ORDER,
            SubChildEntity.SUBSCRIPTION_ORDER_NON_SERVICE,
          ])
          .select(1),
      )
      .select('invoices.*')
      .first();
  }

  static async getQBData({ condition: { rangeFrom, rangeTo, customerIds } = {} }) {
    const trx = this.knex();
    let query = this.query(trx)
      .leftJoinRelated('orders as o')
      .select([
        this.raw(`${this.tableName}.id invoiceId`),
        this.raw(`${this.tableName}.customer_id customerId`),
        this.raw(
          `case when sum(o.before_taxes_total) > 0 then sum(o.before_taxes_total) else ${this.tableName}.total end AS invoiceTotal`,
        ),
        this.raw('sum(o.surcharges_total) surchargesTotal'),
        this.raw(`${this.tableName}.total - sum(o.before_taxes_total) as invoiceTaxes`),
        this.raw(`${this.tableName}.total invoiceTotalWithTaxes`),
        this.raw(`${this.tableName}.write_off writeOff`),
        this.raw(`o.job_site_id jobSiteId`),
        this.raw('o.business_line_id businessLineId'),
      ]);

    if (rangeFrom) {
      query = query.andWhere(`${this.tableName}.createdAt`, '>', rangeFrom);
    }

    if (rangeTo) {
      query = query.andWhere(`${this.tableName}.createdAt`, '<=', rangeTo);
    }

    if (customerIds?.length) {
      query = query.whereIn(`${this.tableName}.customerId`, customerIds);
    }

    query = query
      .groupBy([`${this.tableName}.id`, 'o.job_site_id', 'o.business_line_id'])
      .orderBy(`${this.tableName}.id`);
    return query;
  }

  async $getLob() {
    const { BusinessLine, Subscription } = this.constructor.models;
    const lobs = await BusinessLine.query()
      .whereExists(
        BusinessLine.relatedQuery('orders').findByIds(this.$relatedQuery('orders').select('id')),
      )
      .orWhereExists(
        BusinessLine.relatedQuery('subscriptions').findByIds(
          this.$relatedQuery('subscriptions').select(Subscription.ref('id')),
        ),
      );

    return lobs;
  }

  getCtx(schemaName) {
    return {
      state: {
        schemaName,
        user: { schemaName },
      },
    };
  }

  async $getSubscriptions(invoiceId) {
    const { SubscriptionInvoice, Subscription } = this.constructor.models;
    try {
      let subscriptionsInvoices = [];
      subscriptionsInvoices = await SubscriptionInvoice.query()
        .select('*')
        .innerJoin(
          Subscription.tableName,
          `${Subscription.tableName}.id`,
          `${SubscriptionInvoice.tableName}.subscription_id`,
        )
        .where(`${SubscriptionInvoice.tableName}.invoice_id`, invoiceId);
      if (subscriptionsInvoices.length) {
        subscriptionsInvoices = subscriptionsInvoices.map(async subscription => {
          const serviceItems = [];
          const serviceItemsData = await pricingGetSubscriptionServiceItemById(
            this.getCtx(Subscription.schemaName),
            {
              data: { id: subscription.subscriptionId },
            },
          );
          if (serviceItemsData.length) {
            serviceItemsData.forEach(service => {
              serviceItems.push({
                serviceItemId: service.id,
                serviceName: service.billableService.description,
                lineItems: service.lineItems,
                serviceItems: [
                  {
                    id: service.id,
                    totalPrice: Number(service.quantity * service.price),
                    totalDay: Number(0),
                    usageDay: Number(0),
                    price: service.price,
                    quantity: service.quantity,
                    periodTo: null,
                    periodSince: null,
                    subscriptionOrders: service.subscriptionOrders,
                  },
                ],
              });
            });
          }
          return { ...subscription, serviceItems };
        });
      }

      const result = subscriptionsInvoices;

      return result;
    } catch (error) {
      console.log('🚀 ~ file: invoice.js:1130 ~ Invoice ~ $getSubscriptions ~ error', error);
      this.logger.error(error, `Error. Aborting...`);
      throw new Error(error, `Error. Aborting...`);
    }
  }

  static async processedSubChildItems({ generatedInvoice, subRes }, trx) {
    const { SubscriptionInvoicedEntity } = this.models;

    const { subscriptionInvoice } = generatedInvoice;

    const promises = [];

    // key subscription id
    // value subscriptionInvoice id
    const subscriptionInvoiceIdMap = {};

    for (const subInvoice of subscriptionInvoice) {
      const { subscriptionId, id } = subInvoice;
      subscriptionInvoiceIdMap[subscriptionId] = id;
    }

    for (const [key, value] of Object.entries(subRes.processSubItems)) {
      const subscriptionInvoiceId = subscriptionInvoiceIdMap[key];

      const invoicedEntityData = value.map(entityData => {
        return {
          subscriptionInvoiceId,
          ...entityData,
        };
      });

      const subPromise = SubscriptionInvoicedEntity.create({ data: invoicedEntityData }, trx);

      promises.push(subPromise);
    }

    await Promise.all(promises);
  }

  static async getByCustomerAutoPayType(customer, excludeIds) {
    // get additional invoices for auto pay with statuses: open, overdue.
    // for autopayType lastInvoice: only generated, invoiceDue that reached the due date, accountBalance: all
    const { id: customerId, autopayType } = customer;
    let query;

    const initialQuery = () =>
      this.query()
        .where({
          customerId,
          writeOff: false,
        })
        .whereNotIn(this.ref('id'), excludeIds)
        .andWhere(this.ref('balance'), '>', 0);

    switch (autopayType) {
      case AUTO_PAY_TYPES.lastInvoice: {
        break;
      }

      case AUTO_PAY_TYPES.accountBalance: {
        query = initialQuery();
        break;
      }

      case AUTO_PAY_TYPES.invoiceDue: {
        query = initialQuery();
        query = query.andWhereRaw(`${this.tableName}.due_date < CURRENT_DATE`);
        break;
      }

      default: {
        throw ApplicationError.unknown(`Auto Pay status ${autopayType} is not supported.`);
      }
    }

    const result = query ? await query : [];
    return result ?? [];
  }

  static async decrementBalance({ id, amount }, trx, { log, userId } = {}) {
    const item = await this.query(trx)
      .findById(id)
      .decrement('balance', amount)
      .returning(['id', 'balance', 'type']);

    log && item?.$log({ userId, action: this.logAction.modify });

    return item;
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[customer,businessUnit,payments,orders,emails]');

    return item ? super.castNumbers(item) : null;
  }
}
