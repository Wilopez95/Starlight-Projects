import { INVOICE_CONSTRUCTIONS } from '../consts/invoiceConstructions.js';
import { BILLING_CYCLES } from '../consts/billingCycles.js';
import { PAYMENT_TERMS } from '../consts/paymentTerms.js';
import { APR_TYPES } from '../consts/aprTypes.js';
import { AUTO_PAY_TYPES } from '../consts/customerAutoPayTypes.js';

import { mathRound2 } from '../utils/math.js';

import { getSubsTotalForCurrentPeriod } from '../services/customer.js';
import BaseModel from './_base.js';

export default class Customer extends BaseModel {
  static get tableName() {
    return 'customers';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'id',
        'invoiceConstruction',
        'onAccount',
        'status',
        'addFinanceCharges',
        'mailingAddressLine1',
        'mailingCity',
        'mailingZip',
        'mailingState',
        'billingAddressLine1',
        'billingCity',
        'billingZip',
        'billingState',
        'sendInvoicesByEmail',
        'sendInvoicesByPost',
        'attachTicketPref',
        'attachMediaPref',
      ],

      properties: {
        id: { type: 'integer' },
        businessUnitId: { type: 'integer' },

        businessName: { type: ['string', null] },
        firstName: { type: ['string', null] },
        lastName: { type: ['string', null] },
        status: { type: ['string'] },

        invoiceConstruction: { enum: INVOICE_CONSTRUCTIONS },
        onAccount: { type: 'boolean' },
        billingCycle: { enum: [...BILLING_CYCLES, null] },
        paymentTerms: { enum: [...PAYMENT_TERMS, null] },
        addFinanceCharges: { type: 'boolean' },
        aprType: { enum: [...APR_TYPES, null] },
        financeCharge: { type: ['number', null] },

        mailingAddressLine1: { type: 'string', minLength: 1 },
        mailingAddressLine2: { type: ['string', null] },
        mailingCity: { type: 'string', minLength: 1 },
        mailingState: { type: 'string' },
        mailingZip: { type: 'string', minLength: 5 },

        billingAddressLine1: { type: 'string', minLength: 1 },
        billingAddressLine2: { type: ['string', null] },
        billingCity: { type: 'string', minLength: 1 },
        billingState: { type: 'string' },
        billingZip: { type: 'string', minLength: 5 },

        cardConnectId: { type: ['string', null] },
        fluidPayId: { type: ['string', null] },
        cardConnectIds: {
          type: ['array'],
          default: [],
          items: {
            type: 'string',
          },
        },
        fluidPayIds: {
          type: ['array'],
          default: [],
          items: {
            type: 'string',
          },
        },

        creditLimit: { type: ['number', null] },
        balance: { type: 'number' },

        walkup: { type: 'boolean' },

        sendInvoicesByEmail: { type: 'boolean' },
        sendInvoicesByPost: { type: 'boolean' },
        attachTicketPref: { type: 'boolean' },
        attachMediaPref: { type: 'boolean' },
        invoiceEmails: {
          type: ['array', null],
          default: [],
          items: {
            type: 'string',
            format: 'email',
          },
        },
        statementEmails: {
          type: ['array', null],
          default: [],
          items: {
            type: 'string',
            format: 'email',
          },
        },
        notificationEmails: {
          type: ['array', null],
          default: [],
          items: {
            type: 'string',
            format: 'email',
          },
        },
        mainPhoneNumber: { type: ['string', null] },

        dependencies: {
          firstName: ['lastName'],
          lastName: ['firstName'],
        },
      },
    };
  }

  static get relationMappings() {
    const { BusinessUnit, CreditCard, Order, Payment, Payout, Invoice, Statement } = this.models;
    return {
      businessUnit: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.businessUnitId`,
          to: `${BusinessUnit.tableName}.id`,
        },
      },
      creditCards: {
        relation: BaseModel.HasManyRelation,
        modelClass: CreditCard,
        join: {
          from: `${this.tableName}.id`,
          to: `${CreditCard.tableName}.customerId`,
        },
      },
      orders: {
        relation: BaseModel.HasManyRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.id`,
          to: `${Order.tableName}.customerId`,
        },
      },
      payments: {
        relation: BaseModel.HasManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          to: `${Payment.tableName}.customerId`,
        },
      },
      payouts: {
        relation: BaseModel.HasManyRelation,
        modelClass: Payout,
        join: {
          from: `${this.tableName}.id`,
          to: `${Payout.tableName}.customerId`,
        },
      },
      invoices: {
        relation: BaseModel.HasManyRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.id`,
          to: `${Invoice.tableName}.customerId`,
        },
      },
      statements: {
        relation: BaseModel.HasManyRelation,
        modelClass: Statement,
        join: {
          from: `${this.tableName}.id`,
          to: `${Statement.tableName}.customerId`,
        },
      },
    };
  }

  static async upsertOne(data) {
    const trx = await this.startTransaction();

    let customer;
    try {
      customer = await this.query(trx).upsertGraphAndFetch(data, {
        insertMissing: true,
        noDelete: true,
        noUpdate: ['creditCards', 'invoices', 'payments', 'orders'],
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return customer;
  }

  static async batchIncrementBalances(customersBalances) {
    const trx = await this.startTransaction();

    try {
      await Promise.all(
        customersBalances.map(({ customerId, amount }) =>
          this.incrementBalance(customerId, amount, trx),
        ),
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async batchDecrementBalances(customersBalances) {
    await this.batchIncrementBalances(
      customersBalances.map(({ customerId, amount }) => ({
        customerId,
        amount: -amount,
      })),
    );
  }

  static async decrementBalance(id, amount) {
    const { balance } = await this.query()
      .findById(id)
      .decrement('balance', amount)
      .returning('balance');

    return Number(balance) || 0;
  }

  static async incrementBalance(id, amount, trx) {
    const { balance } = await this.query(trx)
      .findById(id)
      .increment('balance', amount)
      .returning('balance');

    return Number(balance) || 0;
  }

  static async sumNonInvoicedOrdersTotals(customerId) {
    const result = await this.relatedQuery('orders').for(customerId).whereNull('invoiceId').sum({
      total: 'grandTotal',
      capturedTotal: 'capturedTotal',
      onAccountTotal: 'onAccountTotal',
    });
    return result;
  }

  static async getNonInvoicedOrdersTotals(id) {
    const nonInvoicedTotals = await this.sumNonInvoicedOrdersTotals(id);

    let prepaidOnAccount = 0;
    let prepaidTotal = 0;
    let prepaidDeposits = 0;
    for (const { total, capturedTotal, onAccountTotal } of nonInvoicedTotals) {
      prepaidOnAccount += Number(onAccountTotal);
      prepaidTotal += Number(total) - Number(onAccountTotal);
      prepaidDeposits += Number(capturedTotal) || 0;
    }

    return {
      prepaidTotal: mathRound2(Number(prepaidTotal)),
      prepaidOnAccount: mathRound2(Number(prepaidOnAccount)),
      total: mathRound2(Number(prepaidTotal) + Number(prepaidOnAccount)),
      prepaidDeposits: mathRound2(prepaidDeposits),
    };
  }

  static async getBalances(id) {
    const [customer, { prepaidTotal, prepaidOnAccount, prepaidDeposits }] = await Promise.all([
      this.getById(id, ['balance', 'creditLimit']),
      this.getNonInvoicedOrdersTotals(id),
    ]);

    if (!customer) {
      return null;
    }

    const { subsTotalForCurrentPeriod, subsTotalPaid, notInvoicedSubsOrdersTotal } =
      await getSubsTotalForCurrentPeriod(this.schemaName, id);
    const { balance, creditLimit } = customer;
    const nonInvoicedTotal = prepaidTotal + prepaidOnAccount + notInvoicedSubsOrdersTotal;

    const availableCredit = mathRound2(
      Number(creditLimit) -
        Number(balance) -
        nonInvoicedTotal +
        prepaidDeposits -
        subsTotalForCurrentPeriod -
        subsTotalPaid,
    );

    return {
      availableCredit,
      balance,
      creditLimit,
      nonInvoicedTotal,
      prepaidOnAccount,
      prepaidDeposits,
      paymentDue: mathRound2(prepaidTotal - prepaidDeposits),
    };
  }

  static async getWithBusinessUnit(id) {
    const result = await this.query().findById(id).withGraphFetched('businessUnit');

    return result;
  }

  static async getBalancesIn(ids) {
    const balances = await Promise.all(ids.map(id => this.getBalances(id)));
    const customersBalances = {};

    ids.forEach((id, index) => (customersBalances[id] = balances[index]));

    return customersBalances;
  }

  static async getLastStatementEndDateAndBalance(ids) {
    const result = await this.query()
      .findByIds(ids)
      .joinRaw(
        `left join lateral (select customer_id, balance, end_date, pdf_url from ??.statements where customer_id = customers.id order by id desc limit 1) as st on true`,
        [this.schemaName],
      )
      .select([
        Customer.ref('id'),
        Customer.ref('createdAt'),
        'st.endDate',
        'st.balance',
        'st.pdfUrl',
      ]);

    return result;
  }

  static async getByLastInvoicesForAutoPay() {
    // auto pay only invoices with autopayType = lastInvoice, statuses: open, overdue
    const { Invoice } = this.models;
    const result = await this.query()
      .select(`${this.tableName}.*`)
      .where(this.ref('isAutopayExist'), true)
      .withGraphJoined(Invoice.tableName, {
        joinOperation: 'innerJoin',
      })
      .andWhere(Invoice.ref('autopayType'), AUTO_PAY_TYPES.lastInvoice)
      .andWhere(Invoice.ref('balance'), '>', 0)
      .andWhere(Invoice.ref('writeOff'), false)
      .andWhereRaw(`${Invoice.tableName}.due_date < CURRENT_DATE`);

    return result;
  }
}
