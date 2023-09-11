import gql from 'graphql-tag';

import { AprType } from '../consts/aprTypes.js';
import { BillingCycle } from '../consts/billingCycles.js';
import { InvoiceConstruction } from '../consts/invoiceConstructions.js';
import { EmailEvent } from '../consts/emailEvent.js';
import { InvoiceSorting } from '../consts/invoiceSorting.js';
import { PaymentMethod } from '../consts/paymentMethod.js';
import { PaymentStatus, PaymentInvoicedStatus } from '../consts/paymentStatus.js';
import { PaymentTerms } from '../consts/paymentTerms.js';
import { PaymentType } from '../consts/paymentTypes.js';
import { BankDepositType } from '../consts/bankDepositTypes.js';
import { BankDepositStatus } from '../consts/bankDepositStatuses.js';
import { PaymentGateway } from '../consts/paymentGateways.js';
import { RefundType } from '../consts/refundType.js';
import { InvoiceMailing } from '../consts/invoiceMailing.js';
import { PaymentSorting } from '../consts/paymentSorting.js';
import { InvoiceType } from '../consts/invoiceTypes.js';
import { GenerationJobStatus } from '../consts/generationJobStatus.js';
import { InvoiceStatus } from '../consts/invoiceStatus.js';
import { CustomerType } from '../consts/customerType.js';
import { InvoiceAge } from '../consts/invoiceAge.js';
import { DepositSorting } from '../consts/depositSorting.js';
import { BatchStatementSorting } from '../consts/batchStatementSorting.js';
import { SettlementsSorting } from '../consts/settlementsSorting.js';
import { CcSorting } from '../consts/ccSorting.js';
import { PayoutSorting } from '../consts/payoutSorting.js';
import { StatementSorting } from '../consts/statementSorting.js';
import { DeferredPaymentSorting } from '../consts/deferredPaymentSorting.js';
import { FinanceChargesSorting } from '../consts/financeChargesSorting.js';

export const typeDefs = gql`
  enum AprType {
    STANDARD
    CUSTOM
  }

  enum BillingCycle {
    DAILY
    WEEKLY
    MONTHLY
    TWENTY_EIGHT_DAYS
    QUATERLY
    YEARLY
  }

  enum BillingType {
    inAdvance
    arrears
  }

  enum InvoiceConstruction {
    BY_ORDER
    BY_ADDRESS
    BY_CUSTOMER
  }

  enum PaymentMethod {
    CASH
    CHECK
    CREDIT_CARD
    ON_ACCOUNT
    MIXED
  }

  enum PaymentStatus {
    FAILED
    AUTHORIZED
    CAPTURED
    VOIDED
    DEFERRED
  }

  enum PaymentInvoicedStatus {
    APPLIED
    REVERSED
    UNAPPLIED
  }

  enum PaymentTerms {
    COD
    NET_15_DAYS
    NET_30_DAYS
    NET_60_DAYS
  }

  enum PaymentType {
    CASH
    CHECK
    CREDIT_CARD
    CREDIT_MEMO
    REFUND_ON_ACCOUNT
    WRITE_OFF
  }

  enum InvoiceType {
    ORDERS
    FINANCE_CHARGES
    SUBSCRIPTIONS
  }

  enum InvoiceSorting {
    ID
    BALANCE
    CREATED_AT
    DUE_DATE
    TOTAL
    CUSTOMER_NAME
    CUSTOMER_TYPE
    STATUS
  }

  enum EmailEvent {
    PENDING
    SENT
    DELIVERED
    FAILED_TO_SEND
    FAILED_TO_DELIVER
  }

  enum PaymentGateway {
    CARDCONNECT
    FLUIDPAY
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum RefundType {
    CHECK
    CREDIT_CARD
    ON_ACCOUNT
  }

  enum InvoiceMailing {
    ATTACH_TICKET
    ATTACH_ALL_MEDIA
  }

  enum PaymentSorting {
    DATE
    PAYMENT_ID
    PAYMENT_FORM
    STATUS
    UNAPPLIED
    AMOUNT
    CUSTOMER
    DEPOSIT_DATE
  }

  enum PayoutSorting {
    DATE
    PAYOUT_ID
    CUSTOMER
    PAYMENT_FORM
    AMOUNT
  }

  enum DeferredPaymentSorting {
    ID
    STATUS
    DATE
    AMOUNT
    CUSTOMER
    DEFERRED_UNTIL
  }

  enum StatementSorting {
    ID
    BALANCE
    CREATED_AT
    END_DATE
    INVOICES_COUNT
    STATEMENT_DATE
  }

  enum BankDepositType {
    CASH_CHECK
    CREDIT_CARD
    REVERSAL
  }

  enum BankDepositStatus {
    LOCKED
    UNLOCKED
  }

  enum GenerationJobStatus {
    PENDING
    FINISHED
    FAILED
  }

  enum InvoiceStatus {
    OPEN
    CLOSED
    OVERDUE
    WRITE_OFF
  }

  enum CustomerType {
    PREPAID
    ON_ACCOUNT
  }

  enum InvoiceAge {
    CURRENT
    OVERDUE_31_DAYS
    OVERDUE_61_DAYS
    OVERDUE_91_DAYS
  }

  enum DepositSorting {
    ID
    DATE
    DEPOSIT_TYPE
    MERCHANT_ID
    COUNT
    SYNC_WITH_QB
    STATUS
    TOTAL
  }

  enum BatchStatementSorting {
    ID
    STATEMENT_DATE
    END_DATE
    COUNT
    TOTAL
  }

  enum SettlementsSorting {
    DATE
    PROCESSOR
    COUNT
    AMOUNT
    FEES
    ADJUSTMENT
    NET
    MERCHANT_ID
  }

  enum CcSorting {
    ID
    STATUS
    CARD_NICKNAME
    CARD_TYPE
    EXPIRATION_DATE
    PAYMENT_GATEWAY
    CARD_NUMBER
  }

  enum FinanceChargesSorting {
    ID
    STATUS
    CREATED_AT
    TOTAL
    REMAINING_BALANCE
    CUSTOMER
    CUSTOMER_TYPE
  }
`;

// TODO: improve sorting params
export const resolvers = {
  AprType,
  BillingCycle,
  InvoiceConstruction,
  InvoiceType,
  EmailEvent,
  InvoiceSorting,
  PaymentMethod,
  PaymentTerms,
  PaymentStatus,
  PaymentInvoicedStatus,
  PaymentType,
  PaymentGateway,
  RefundType,
  InvoiceMailing,
  PaymentSorting,
  BankDepositType,
  BankDepositStatus,
  GenerationJobStatus,
  InvoiceStatus,
  CustomerType,
  InvoiceAge,
  DepositSorting,
  BatchStatementSorting,
  SettlementsSorting,
  CcSorting,
  PayoutSorting,
  StatementSorting,
  DeferredPaymentSorting,
  FinanceChargesSorting,
};
