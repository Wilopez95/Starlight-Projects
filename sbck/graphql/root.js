import gql from 'graphql-tag';
import { addDays } from 'date-fns';

import { attachToFields, isAuthenticated, parseDateRange } from '../utils/graphqlHelpers.js';
import { parseSearchQuery } from '../utils/search.js';

import ApplicationError from '../errors/ApplicationError.js';

import { CcSorting } from '../consts/ccSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import { SettlementsSorting } from '../consts/settlementsSorting.js';
import { PaymentSorting } from '../consts/paymentSorting.js';
import { PayoutSorting } from '../consts/payoutSorting.js';
import { StatementSorting } from '../consts/statementSorting.js';
import { DepositSorting } from '../consts/depositSorting.js';
import { BatchStatementSorting } from '../consts/batchStatementSorting.js';
import { DeferredPaymentSorting } from '../consts/deferredPaymentSorting.js';
import { FinanceChargesSorting } from '../consts/financeChargesSorting.js';
import { InvoiceSorting } from '../consts/invoiceSorting.js';
import {
  BILLING_PERMISSIONS,
  ORDERS_PERMISSIONS,
  CUSTOMERS_PERMISSIONS,
  RECYCLING_PERMISSIONS,
  CUSTOMER_PORTAL_PERMISSIONS,
} from '../consts/permissions.js';
import { getCreditCard, getCreditCards } from './queries.js';
import {
  deleteStatement,
  incrementCustomerBalance,
  requestSettlement,
  createUnappliedPayment,
  createPayout,
  refundUnappliedPayment,
  refundPrepaidOrder,
  chargeDeferredPayment,
  chargeDeferredPayments,
  sendInvoices,
  writeOffInvoices,
  sendStatements,
  upsertCreditCard,
  updateCreditCard,
  deleteCreditCard,
  editCreditMemo,
  deleteCreditMemo,
  newMultiOrderPayment,
  createFinanceCharge,
  sendFinanceCharges,
  deleteBankDeposit,
  createBatchStatement,
  sendBatchStatements,
} from './mutations.js';

export const typeDefs = gql`
    type Query {
        order(id: ID!): Order @authorized(permissions: ["${ORDERS_PERMISSIONS.ordersViewAll}"])
        orders(offset: Int = 0, limit: Int = 25): [Order!]!
            @authorized(permissions: ["${ORDERS_PERMISSIONS.ordersViewAll}"])

        invoice(id: ID!): Invoice @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoices}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalInvoicesView}"])
        invoicesCount(
            businessUnitId: ID
            customerId: ID
            jobSiteId: ID
            subscriptionId: ID
            filters: InvoiceFilters
            query: String
        ): Int! @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoices}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalInvoicesList}"])
        invoices(
            customerId: ID
            businessUnitId: ID
            subscriptionId: ID
            jobSiteId: ID
            filters: InvoiceFilters
            query: String
            offset: Int = 0
            limit: Int = 25
            sortBy: InvoiceSorting = ID
            sortOrder: SortOrder = ASC
        ): [Invoice!]! @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoices}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalInvoicesList}"])
        invoiceBySubOrderId(orderId: ID!): Invoice @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoices}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalInvoicesView}"])


        payment(id: ID!): Payment @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPaymentsView}"])
        payments(
            customerId: ID
            filters: PaymentFilters
            query: String
            businessUnitId: ID
            offset: Int = 0
            limit: Int = 25
            sortBy: PaymentSorting = DATE
            sortOrder: SortOrder = DESC
        ): [Payment] @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPayments}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalPaymentsList}"])
        unconfirmedPayments(settlementId: ID!): [Payment!]!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPaymentsView}"])
        deferredPayments(
            customerId: ID
            businessUnitId: ID
            offset: Int = 0
            limit: Int = 25
            failedOnly: Boolean = false
            sortBy: DeferredPaymentSorting = DEFERRED_UNTIL
            sortOrder: SortOrder = DESC
        ): [Payment] @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsDeferredFullAccess}"])
        prepaidPayment(orderId: ID!): Payment
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPaymentsView}"])

        nonInvoicedOrdersTotals(customerId: ID!): NonInvoicedOrdersTotals
            @authorized(permissions: ["${CUSTOMERS_PERMISSIONS.customersView}"])
        customerBalances(customerId: ID!): Balances
            @authorized(permissions: ["${CUSTOMERS_PERMISSIONS.customersView}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalProfileView}", "${RECYCLING_PERMISSIONS.recyclingCustomerView}"])

        payout(id: ID!): Payout @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPayout}"])
        payouts(
            customerId: ID
            businessUnitId: ID
            offset: Int = 0
            limit: Int = 25
            filters: PayoutFilters
            query: String
            sortBy: PayoutSorting = DATE
            sortOrder: SortOrder = DESC
        ): [Payout!]! @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPayout}"])

        settlements(
            offset: Int = 0
            limit: Int = 25
            businessUnitId: ID!
            from: String
            to: String
            sortBy: SettlementsSorting = DATE
            sortOrder: SortOrder = DESC
        ): [Settlement!]! @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])
        settlement(id: ID!): Settlement
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])
        settlementTransactions(
            settlementId: ID!
            offset: Int = 0
            limit: Int = 25
        ): [SettlementTransaction!] @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])
        settlementsCount(businessUnitId: ID!): Int!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])

        statements(
            businessUnitId: ID
            customerId: ID
            offset: Int = 0
            limit: Int = 25
            sortBy: StatementSorting = ID
            sortOrder: SortOrder = DESC
        ): [Statement!]! @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalStatementsList}"])
        statement(id: ID!): Statement
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        newStatementEndDate(customerId: ID!): String!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])

        creditCard(id: ID!): CreditCardExtended @authorized
        creditCards(
            customerId: ID
            activeOnly: Boolean = false
            jobSiteId: ID
            relevantOnly: Boolean = false
            offset: Int = 0
            limit: Int = 25
            isAutopay: Boolean
            sortBy: CcSorting = ID,
            sortOrder: SortOrder = DESC
        ): [CreditCardExtended] @authorized
        financeCharge(id: ID!): FinanceCharge
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingFinanceChargesFullAccess}"])
        financeCharges(
            businessUnitId: ID
            customerId: ID
            filters: FinanceChargeFilters
            query: String
            offset: Int = 0
            limit: Int = 25
            sortBy: FinanceChargesSorting = ID,
            sortOrder: SortOrder = DESC
        ): [FinanceCharge!]! @authorized(permissions: ["${BILLING_PERMISSIONS.billingFinanceChargesFullAccess}"])

        bankDeposit(id: ID!): BankDeposit
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBankDepositsFullAccess}"])
        bankDeposits(
            businessUnitId: ID,
            offset: Int = 0,
            limit: Int = 25,
            sortBy: DepositSorting = DATE,
            sortOrder: SortOrder = ASC
        ): [BankDeposit]
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBankDepositsFullAccess}"])
        batchStatements(
            businessUnitId: ID,
            offset: Int = 0,
            limit: Int = 25,
            sortBy: BatchStatementSorting = ID,
            sortOrder: SortOrder = DESC
        ): [BatchStatement!]!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        batchStatement(id: ID!): BatchStatement
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        generationJobStatus(id: ID!): GenerationJob
            @authorized(
                permissions: [
                    "${BILLING_PERMISSIONS.billingInvoicesInvoicing}"
                    "${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"
                    "${BILLING_PERMISSIONS.billingFinanceChargesFullAccess}"
                    "${BILLING_PERMISSIONS.billingSettlementsFullAccess}"
                ]
            )
        invoiceGenerationJob(id: ID!): InvoiceGenerationJobResult
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoicesInvoicing}"])
        statementGenerationJob(id: ID!): StatementGenerationJobResult
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        finChargeGenerationJob(id: ID!): FinChargeGenerationJobResult
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingFinanceChargesFullAccess}"])
        settlementGenerationJob(id: ID!): SettlementGenerationJobResult
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])
        customersLastStatementBalance(ids: [ID!]!): [CustomerLastStatementBalance!]!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
    }

    type Mutation {
        applyPayment(paymentId: ID!, applications: [PaymentApplicationInput!]!): Payment!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPayments}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalPaymentsUpdate}"])
        reversePayment(paymentId: ID!, reverseData: ReverseDataInput!): Payment!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsReverse}"])
        createUnappliedPayment(customerId: ID!, data: UnappliedPaymentInput!): Payment!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPayments}", "${CUSTOMER_PORTAL_PERMISSIONS.customerPortalPaymentsCreate}"])
        createPayout(customerId: ID!, data: PayoutInput!): Payout!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsPayout}"])
        refundUnappliedPayment(paymentId: ID!, amount: Float!): Payment!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsRefund}"])
        chargeDeferredPayment(paymentId: ID!): Payment!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsChargeDeferred}"])
        chargeDeferredPayments(paymentIds: [ID!]!): [Payment!]!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsChargeDeferred}"])
        refundPrepaidOrder(
            orderId: ID!
            amount: Float!
            refundType: RefundType!
            refundedPaymentId: ID!
            checkNumber: String
        ): Float! @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoicesRefund}"])
        requestSettlement(date: String!, businessUnitId: ID!, merchantId: ID!, mid: String!): ID!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])
        deleteSettlements(ids: [ID!]!): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingSettlementsFullAccess}"])
        sendInvoices(
            invoiceIds: [Int!]!
            attachMedia: InvoiceMailing
            sendToCustomerInvoiceEmails: Boolean
            customerEmails: [String!]!
        ): Boolean @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoices}"])
        ordersPutOnAccount(orderIds: [Int!]!, overrideCreditLimit: Boolean): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoicesPutOnAccount}"])
        writeOffInvoices(invoiceIds: [ID!]!, customerId: ID!, note: String!): Payment!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingWriteOffsFullAccess}"])
        createStatement(
            businessUnitId: ID!
            customerId: ID!
            statementDate: String!
            endDate: String!
        ): ID! @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        deleteStatement(id: ID!): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        sendStatements(ids: [ID!]!, emails: [String!]): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        addCreditCard(customerId: ID!, data: AddCreditCardInput): CreditCardExtended @authorized
        updateCreditCard(id: ID!, data: EditCreditCardInput): CreditCardExtended @authorized
        deleteCreditCard(id: ID!): Boolean @authorized
        editCreditMemo(id: ID!, data: EditCreditMemoInput): Payment
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsCreditMemo}"])
        deleteCreditMemo(id: ID!): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingPaymentsCreditMemo}"])
        newMultiOrderPayment(customerId: ID!, data: NewMultiOrderPayment): Payment
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingInvoicesPayment}"])
        createFinanceCharge(data: [FinanceChargeInput!]!): ID!
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingFinanceChargesFullAccess}"])
        sendFinanceCharges(ids: [ID!]!, emails: [String!]): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingFinanceChargesFullAccess}"])
        lockBankDeposit(businessUnitId: ID!, date: String!): BankDeposit
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBankDepositsLock}"])
        unlockBankDeposit(id: ID!, businessUnitId: ID!): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBankDepositsLock}"])
        deleteBankDeposit(id: ID!): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBankDepositsFullAccess}"])
        createBatchStatement(
            businessUnitId: ID!
            customerIds: [ID!]!
            statementDate: String!
            endDate: String!
        ): ID @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
        sendBatchStatements(ids: [ID!]!): Boolean
            @authorized(permissions: ["${BILLING_PERMISSIONS.billingBatchStatementsFullAccess}"])
    }
`;

const baseResolvers = {
  Query: {
    order: async (_, { id }, ctx) => {
      const item = await ctx.models.Order.getById(id);
      return item;
    },
    orders: async (_, { offset, limit }, ctx) => {
      const items = await ctx.models.Order.getAllPaginated({ offset, limit });
      return items;
    },
    invoice: async (_, { id }, ctx) => {
      const item = await ctx.models.Invoice.getById(id);
      return item;
    },
    invoices: async (_, args, ctx) => {
      const {
        businessUnitId,
        limit,
        subscriptionId,
        offset,
        filters,
        query,
        sortBy = InvoiceSorting.ID,
        sortOrder = SortOrder.DESC,
      } = args;

      const invoices = await ctx.models.Invoice.getAllPaginated({
        condition: {
          customerIds: args.customerId ? [args.customerId] : undefined,
          jobSiteId: args.jobSiteId,
          businessUnitId,
          subscriptionId,
          filters,
          ...parseSearchQuery(query),
        },
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return invoices;
    },
    invoicesCount: async (
      _,
      { businessUnitId, customerId, subscriptionId, jobSiteId, filters, query },
      ctx,
    ) => {
      const count = await ctx.models.Invoice.countAll({
        businessUnitId,
        customerId,
        jobSiteId,
        subscriptionId,
        filters,
        ...parseSearchQuery(query),
      });
      return count;
    },
    payment: async (_, { id }, ctx) => {
      const item = await ctx.models.Payment.getById(id);
      return item;
    },
    payments: async (
      _,
      {
        customerId,
        businessUnitId,
        filters,
        query,
        offset,
        limit,
        sortBy = PaymentSorting.DATE,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const items = await ctx.models.Payment.getAllPaginated({
        condition: { customerId, businessUnitId, filters, ...parseSearchQuery(query) },
        offset,
        limit,
        sortBy,
        sortOrder,
      });
      return items;
    },
    unconfirmedPayments: async (_, { settlementId }, ctx) => {
      const items = await ctx.models.Payment.getUnconfirmedBySettlement({
        condition: { settlementId },
      });

      return items;
    },
    deferredPayments: async (
      _,
      {
        customerId,
        businessUnitId,
        offset,
        limit,
        failedOnly,
        sortBy = DeferredPaymentSorting.DEFERRED_UNTIL,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const items = await ctx.models.Payment.getDeferredPaginated({
        condition: { customerId, businessUnitId, failedOnly },
        offset,
        limit,
        sortBy,
        sortOrder,
      });
      return items;
    },
    prepaidPayment: async (_, { orderId }, ctx) => {
      const item = await ctx.models.Order.getCapturedPrepaidPayment(orderId);
      return item;
    },
    invoiceBySubOrderId: async (_, { orderId }, ctx) => {
      const item = await ctx.models.Invoice.getBySubOrderId(orderId);
      return item;
    },
    nonInvoicedOrdersTotals: async (_, { customerId }, ctx) => {
      const totals = await ctx.models.Customer.getNonInvoicedOrdersTotals(customerId);
      return totals;
    },
    customerBalances: async (_, { customerId }, ctx) => {
      const balances = await ctx.models.Customer.getBalances(customerId);
      return balances;
    },
    payout: async (_, { id }, ctx) => {
      const item = await ctx.models.Payout.getById(id);
      return item;
    },
    payouts: async (
      _,
      {
        businessUnitId,
        customerId,
        filters,
        query,
        offset,
        limit,
        sortBy = PayoutSorting.DATE,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const items = await ctx.models.Payout.getAllPaginated({
        condition: { customerId, businessUnitId, filters, ...parseSearchQuery(query) },
        offset,
        limit,
        sortBy,
        sortOrder,
      });
      return items;
    },
    settlements: async (_, args, ctx) => {
      const { limit, offset, sortBy = SettlementsSorting.DATE, sortOrder = SortOrder.DESC } = args;
      const { from, to } = parseDateRange(args);

      const items = await ctx.models.Settlement.getAllPaginated({
        condition: { from, to, businessUnitId: args.businessUnitId },
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return items;
    },
    settlement: async (_, { id }, ctx) => {
      const item = await ctx.models.Settlement.getById(id);
      return item;
    },
    settlementTransactions: async (_, { settlementId, limit, offset }, ctx) => {
      const items = await ctx.models.SettlementTransaction.getAllPaginated({
        condition: { settlementId },
        offset,
        limit,
      });

      return items;
    },
    settlementsCount: async (_, { businessUnitId }, ctx) => {
      const count = await ctx.models.Settlement.count({ condition: { businessUnitId } });

      return count;
    },
    statements: async (
      _,
      {
        customerId,
        businessUnitId,
        offset,
        limit,
        sortBy = StatementSorting.ID,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const items = await ctx.models.Statement.getAllPaginated({
        condition: { customerId, businessUnitId },
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return items;
    },
    statement: async (_, { id }, ctx) => {
      const item = await ctx.models.Statement.getById(id);
      return item;
    },
    newStatementEndDate: async (_, { customerId }, ctx) => {
      const { Customer, Statement } = ctx.models;
      const lastStatement = await Statement.getLast(customerId, 'endDate');

      if (lastStatement) {
        return new Date(addDays(lastStatement.endDate, 1)).toUTCString();
      }

      const customer = await Customer.getById(customerId, ['createdAt']);

      return new Date(customer.createdAt).toUTCString();
    },
    creditCard: async (_, { id }, ctx) => {
      const creditCard = await getCreditCard(ctx, { id });

      return creditCard;
    },
    creditCards: async (
      _,
      {
        customerId,
        activeOnly,
        jobSiteId,
        relevantOnly,
        offset,
        limit,
        isAutopay,
        sortBy = CcSorting.ID,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const creditCards = await getCreditCards(ctx, {
        customerId,
        activeOnly,
        jobSiteId,
        relevantOnly,
        offset,
        limit,
        isAutopay,
        sortBy,
        sortOrder,
      });

      return creditCards;
    },
    financeCharge: async (_, { id }, ctx) => {
      const item = await ctx.models.FinanceCharge.getById(id);
      return item;
    },
    financeCharges: async (
      _,
      {
        businessUnitId,
        customerId,
        filters,
        query,
        offset,
        limit,
        sortBy = FinanceChargesSorting.ID,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const items = await ctx.models.FinanceCharge.getAllPaginated({
        condition: { businessUnitId, customerId, filters, ...parseSearchQuery(query) },
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return items;
    },
    bankDeposit: async (_, { id }, ctx) => {
      const item = await ctx.models.BankDeposit.getById(id);

      return item;
    },
    bankDeposits: async (
      _,
      { businessUnitId, offset, limit, sortBy = DepositSorting.ID, sortOrder = SortOrder.ASC },
      ctx,
    ) => {
      const items = await ctx.models.BankDeposit.getAllPaginated({
        condition: { businessUnitId },
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return items;
    },
    batchStatements: async (
      _,
      {
        businessUnitId,
        offset,
        limit,
        sortBy = BatchStatementSorting.ID,
        sortOrder = SortOrder.DESC,
      },
      ctx,
    ) => {
      const items = await ctx.models.BatchStatement.getAllPaginated({
        condition: { businessUnitId },
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return items;
    },
    batchStatement: async (_, { id }, ctx) => {
      const item = await ctx.models.BatchStatement.getById(id);
      return item;
    },
    generationJobStatus: async (_, { id }, ctx) => {
      const item = await ctx.models.GenerationJob.getById(id);
      return item;
    },
    invoiceGenerationJob: async (_, { id }, ctx) => {
      const item = await ctx.models.GenerationJob.getInvoiceGenerationResult(id);

      if (!item) {
        throw ApplicationError.notFound(`Job with id ${id} not found`);
      }

      return item;
    },
    statementGenerationJob: async (_, { id }, ctx) => {
      const item = await ctx.models.GenerationJob.getStatementGenerationResult(id);

      if (!item) {
        throw ApplicationError.notFound(`Job with id ${id} not found`);
      }

      return item;
    },
    finChargeGenerationJob: async (_, { id }, ctx) => {
      const item = await ctx.models.GenerationJob.getFinChargeGenerationResult(id);

      if (!item) {
        throw ApplicationError.notFound(`Job with id ${id} not found`);
      }

      return item;
    },
    settlementGenerationJob: async (_, { id }, ctx) => {
      const item = await ctx.models.GenerationJob.getSettlementGenerationResult(id);

      if (!item) {
        throw ApplicationError.notFound(`Job with id ${id} not found`);
      }

      return item;
    },
    customersLastStatementBalance: async (_, { ids }, ctx) => {
      let items = await ctx.models.Customer.getLastStatementEndDateAndBalance(ids);

      items = items?.map(({ id, balance }) => ({ id, statementBalance: balance }));

      return items;
    },
  },
  Mutation: {
    applyPayment: async (_, { paymentId, applications }, ctx) => {
      const { userId } = ctx.user;

      const items = await ctx.models.Payment.applyToInvoices(
        ctx,
        paymentId,
        { applications },
        undefined,
        { log: true, userId },
      );
      return items;
    },
    reversePayment: async (_, { paymentId, reverseData }, ctx) => {
      const { Payment } = ctx.models;

      const payment = await Payment.getByIdWithBu(paymentId);
      if (!payment) {
        throw ApplicationError.notFound('No such payment exists');
      }

      const { userId } = ctx.user;
      const businessUnitId = payment.businessUnit.id;

      const updatedPayment = await payment.$reverse(
        { businessUnitId, reverseData },
        {
          log: true,
          userId,
        },
      );

      const { customerId, amount } = updatedPayment;

      await incrementCustomerBalance(ctx, customerId, amount);

      return updatedPayment;
    },
    createUnappliedPayment: async (_, { customerId, data }, ctx) => {
      const payment = await createUnappliedPayment(ctx, { customerId, data }, { log: true });
      return payment;
    },
    createPayout: async (_, { customerId, data }, ctx) => {
      const payout = await createPayout(ctx, { customerId, data }, { log: true });
      return payout;
    },
    refundUnappliedPayment: async (_, { paymentId, amount }, ctx) => {
      const payment = await refundUnappliedPayment(ctx, { paymentId, amount }, { log: true });
      return payment;
    },
    refundPrepaidOrder: async (
      _,
      { refundedPaymentId, orderId, amount, refundType, checkNumber },
      ctx,
    ) => {
      const refundedPayment = await ctx.models.Payment.getByIdForRefund(refundedPaymentId);
      if (!refundedPayment) {
        throw ApplicationError.notFound(`No Payment with id ${refundedPaymentId} exists`);
      }

      const refundedTotal = await refundPrepaidOrder(
        ctx,
        {
          refundedPayment,
          orderId,
          businessUnitId: Number(refundedPayment.customer.businessUnitId),
          amount,
          refundType,
          checkNumber,
        },
        { updateRefundedTotal: true, log: true },
      );

      return refundedTotal;
    },
    chargeDeferredPayment: async (_, { paymentId }, ctx) => {
      const payment = await chargeDeferredPayment(ctx, { paymentId });
      return payment;
    },
    chargeDeferredPayments: async (_, { paymentIds = [] }, ctx) => {
      if (paymentIds?.length) {
        const payments = await chargeDeferredPayments(ctx, paymentIds, { log: true });
        return payments;
      }
      return [];
    },
    requestSettlement: async (_, { date, merchantId, businessUnitId, mid }, ctx) => {
      const generationJobId = await requestSettlement(
        ctx,
        {
          date,
          merchantId,
          mid,
          businessUnitId,
        },
        { log: true },
      );
      return generationJobId;
    },
    deleteSettlements: async (_, { ids }, ctx) => {
      const { userId } = ctx.user;

      await ctx.models.Settlement.deleteByIds(ids, { log: true, userId });

      return true;
    },
    sendInvoices: async (
      _,
      { invoiceIds, attachMedia, customerEmails, sendToCustomerInvoiceEmails },
      ctx,
    ) => {
      const result = await sendInvoices(ctx, {
        invoiceIds,
        attachMedia,
        customerEmails,
        sendToCustomerInvoiceEmails,
      });

      return result;
    },
    ordersPutOnAccount: async (_, { orderIds, overrideCreditLimit }, ctx) => {
      const items = await ctx.models.Order.putOnAccount(orderIds, { overrideCreditLimit });
      return items;
    },
    createStatement: async (_, { businessUnitId, customerId, statementDate, endDate }, ctx) => {
      const result = await createBatchStatement(
        ctx,
        {
          businessUnitId,
          customerIds: [customerId],
          statementDate,
          endDate,
        },
        { log: true },
      );

      return result;
    },
    deleteStatement: async (_, { id }, ctx) => {
      const result = await deleteStatement(ctx, { id }, { log: true });

      return result;
    },
    sendStatements: async (_, { ids, emails }, ctx) => {
      const result = await sendStatements(ctx, { ids, emails });

      return result;
    },
    createFinanceCharge: async (_, { data }, ctx) => {
      const result = await createFinanceCharge(ctx, data, { log: true });

      return result;
    },
    sendFinanceCharges: async (_, { ids, emails }, ctx) => {
      const result = await sendFinanceCharges(ctx, { ids, emails });

      return result;
    },
    writeOffInvoices: async (_, { invoiceIds, customerId, note }, ctx) => {
      const writeOffPayment = await writeOffInvoices(
        ctx,
        {
          invoiceIds,
          customerId,
          note,
        },
        { log: true },
      );

      return writeOffPayment;
    },
    addCreditCard: async (_, { customerId, data }, ctx) => {
      const { Customer } = ctx.models;

      const customer = await Customer.getById(customerId);

      if (!customer) {
        throw ApplicationError.notFound(`Customer ${customerId} not found`);
      }

      const { userId } = ctx.user;
      const { creditCard } = await upsertCreditCard(ctx, { newCreditCard: data }, customer, {
        log: true,
        userId,
      });

      return creditCard;
    },
    updateCreditCard: async (_, { id, data }, ctx) => {
      const cc = await updateCreditCard(ctx, { id, data }, { log: true, userId: ctx.user.userId });
      return cc;
    },
    deleteCreditCard: async (_, { id }, ctx) => {
      const result = await deleteCreditCard(ctx, { id }, { log: true });
      return result;
    },
    editCreditMemo: async (_, { id, data }, ctx) => {
      const payment = await editCreditMemo(ctx, { id, data }, { log: true });
      return payment;
    },
    deleteCreditMemo: async (_, { id }, ctx) => {
      const payment = await deleteCreditMemo(ctx, { id }, { log: true });
      return payment;
    },
    newMultiOrderPayment: async (_, { customerId, data }, ctx) => {
      const payment = await newMultiOrderPayment(ctx, { customerId, data }, { log: true });
      return payment;
    },
    lockBankDeposit: async (_, { businessUnitId, date }, ctx) => {
      const { tenantId, userId } = ctx.state.user;

      const result = await ctx.models.BankDeposit.lockBankDeposits(
        ctx,
        {
          businessUnitId: Number(businessUnitId),
          tenantId,
          date,
        },
        { log: true, userId },
      );

      return result;
    },
    unlockBankDeposit: async (_, { id, businessUnitId }, ctx) => {
      const { tenantId, userId } = ctx.state.user;

      await ctx.models.BankDeposit.unlockBankDeposit(
        ctx,
        {
          id,
          businessUnitId,
          tenantId,
        },
        { log: true, userId },
      );

      return true;
    },
    deleteBankDeposit: async (_, { id }, ctx) => {
      const { userId } = ctx.state.user;

      const result = await deleteBankDeposit(ctx, { id, log: true, userId });

      return result;
    },
    createBatchStatement: async (
      _,
      { businessUnitId, customerIds, statementDate, endDate },
      ctx,
    ) => {
      const result = await createBatchStatement(
        ctx,
        {
          businessUnitId,
          customerIds,
          statementDate,
          endDate,
        },
        { log: true },
      );

      return result;
    },
    sendBatchStatements: async (_, { ids }, ctx) => {
      const result = await sendBatchStatements(ctx, { ids });

      return result;
    },
  },
};

export const resolvers = attachToFields(isAuthenticated, baseResolvers, 'Query');
