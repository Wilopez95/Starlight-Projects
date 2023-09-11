import { APR_TYPES } from '../../../consts/aprTypes.js';
import { BILLING_CYCLES, BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { INVOICE_CONSTRUCTIONS } from '../../../consts/invoiceConstructions.js';
import { PAYMENT_TERMS } from '../../../consts/paymentTerms.js';
import { PAYMENT_TYPES } from '../../../consts/paymentTypes.js';
import { PAYMENT_GATEWAYS } from '../../../consts/paymentGateways.js';
import { PAYMENT_METHODS } from '../../../consts/paymentMethod.js';
import { REVERSE_TYPES } from '../../../consts/reverseTypes.js';
import { EMAIL_EVENTS } from '../../../consts/emailEvent.js';
import { REFUND_TYPES } from '../../../consts/refundType.js';
import { DEPOSIT_STATUSES } from '../../../consts/bankDepositStatuses.js';
import { DEPOSIT_TYPES } from '../../../consts/bankDepositTypes.js';
import { INVOICE_TYPES, InvoiceType } from '../../../consts/invoiceTypes.js';
import { GENERATION_JOB_STATUSES } from '../../../consts/generationJobStatus.js';
import { BILLABLE_ITEM_TYPES } from '../../../consts/billableItemTypes.js';
import { STATEMENT_SECTIONS } from '../../../consts/statementSections.js';
import { BUSINESS_UNIT_TYPES, BUSINESS_UNIT_TYPE } from '../../../consts/businessUnitTypes.js';
import { AUTO_PAY_TYPES_VALUES } from '../../../consts/customerAutoPayTypes.js';
import { BUSINESS_LINE_TYPES } from '../../../consts/businessLineTypes.js';
import { BILLING_TYPES } from '../../../consts/billingTypes.js';
import { CUSTOMER_STATUS, CUSTOMER_STATUSES } from '../../../consts/customerStatuses.js';
import {
  PAYMENT_STATUSES,
  PAYMENT_INVOICED_STATUSES,
  PaymentInvoicedStatus,
} from '../../../consts/paymentStatus.js';

export const up = async (migrationBuilder, schema) => {
  await migrationBuilder
    .createSchema(schema)
    .createTable('business_lines', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);

      t.column('name').text().notNullable();
      t.column('description').text();
      t.column('short_name').text().notNullable().defaultTo('');

      t.column('type')
        .text()
        .in(...BUSINESS_LINE_TYPES)
        .notNullable();

      t.timestamps();
    })
    .createTable('business_units', t => {
      t.column('id').integer().primary();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('type')
        .text()
        .in(...BUSINESS_UNIT_TYPES)
        .notNullable()
        .defaultTo(BUSINESS_UNIT_TYPE.HAULING);

      t.column('name_line_1').text().notNullable();
      t.column('time_zone_name').text();
      t.column('logo_url').text();

      t.timestamps();
    })
    .createTable('merchants', t => {
      t.column('id').integer().primary();

      t.column('business_unit_id').integer().notNullable();

      t.column('payment_gateway')
        .text()
        .notNullable()
        .in(...PAYMENT_GATEWAYS);

      t.column('mid').text();
      t.column('username').text();
      t.column('password').text();

      t.column('salespoint_mid').text();
      t.column('salespoint_username').text();
      t.column('salespoint_password').text();

      t.check(
        `("mid" is not null and "username" is not null and "password" is not null)
             or ("mid" is null and "username" is null and "password" is null)`,
      );

      t.check(
        `("salespoint_mid" is not null and "salespoint_username" is not null and "salespoint_password" is not null)
            or ("salespoint_mid" is null and "salespoint_username" is null and "salespoint_password" is null)`,
      );

      t.timestamps();
    })
    .createTable('customers', t => {
      t.column('id').integer().primary();

      t.column('business_unit_id').integer().references('business_units').notNullable();

      t.column('status')
        .text()
        .notNullable()
        .in(...CUSTOMER_STATUSES)
        .defaultTo(CUSTOMER_STATUS.active);
      t.column('business_name').text();
      t.column('first_name').text();
      t.column('last_name').text();
      t.column('name')
        .text()
        .generated(`coalesce(business_name, first_name || ' ' || last_name)`)
        .notNullable();

      t.column('invoice_construction')
        .text()
        .in(...INVOICE_CONSTRUCTIONS)
        .notNullable();
      t.column('on_account').boolean().notNullable().defaultTo(false);
      t.column('credit_limit').numeric().notNullable().defaultTo(0);
      t.column('billing_cycle')
        .text()
        .in(...BILLING_CYCLES);
      t.column('payment_terms')
        .text()
        .in(...PAYMENT_TERMS);
      t.column('balance').numeric().notNullable().defaultTo(0);
      t.column('add_finance_charges').boolean().notNullable().defaultTo(false);
      t.column('apr_type')
        .text()
        .in(...APR_TYPES);
      t.column('finance_charge').numeric();

      t.addAddressFields('mailing');
      t.addAddressFields('billing');

      t.column('send_invoices_by_post').boolean().notNullable().defaultTo(false);
      t.column('send_invoices_by_email').boolean().notNullable().defaultTo(true);
      t.column('attach_ticket_pref').boolean().notNullable().defaultTo(false);
      t.column('attach_media_pref').boolean().notNullable().defaultTo(false);
      t.column('invoice_emails').arrayOf('text');
      t.column('statement_emails').arrayOf('text');
      t.column('notification_emails').arrayOf('text');
      t.column('main_phone_number').text();

      t.column('is_autopay_exist').boolean().notNullable().defaultTo(false);
      // it can be null
      t.column('autopay_type')
        .text()
        .in(...AUTO_PAY_TYPES_VALUES);

      t.column('card_connect_id').text();
      t.column('fluid_pay_id').text();

      t.timestamps();
    })
    .createTable('credit_cards', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);

      t.column('customer_id')
        .integer()
        .notNullable()
        .references({ table: 'customers', onDelete: 'cascade' });

      t.column('card_nickname').text();
      t.column('card_type').text();
      t.column('card_number_last_digits').text();

      // CC fields
      t.column('cc_account_id').text().notNullable();
      t.column('cc_account_token').text();

      t.column('is_autopay').boolean().notNullable().defaultTo(false);

      t.column('merchant_id').integer().references('merchants').notNullable();
      t.column('cardholder_id').text();

      // shortcut to avoid joins
      t.column('payment_gateway')
        .text()
        .in(...PAYMENT_GATEWAYS)
        .notNullable();

      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.timestamps();
    })
    .createTable('job_sites', t => {
      t.column('id').integer().primary();

      t.addAddressFields();

      t.timestamps();
    })
    .createTable('customer_job_site', t => {
      t.column('id').integer().primary();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('job_site_id').integer().notNullable().references('job_sites');

      t.column('send_invoices_to_job_site').boolean().notNullable().defaultTo(true);
      t.column('invoice_emails').arrayOf('text');

      t.timestamps();
    })
    .createTable('invoices', t => {
      t.column('id').integer().identity();

      t.column('due_date').date();

      t.column('csr_email').text().notNullable();
      t.column('csr_name').text().notNullable();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('job_site_original_id').integer();

      t.column('pdf_url').text();
      t.column('preview_url').text();

      t.column('total').numeric().notNullable();
      t.column('balance').numeric().notNullable();

      t.column('write_off').boolean().notNullable().defaultTo(false);

      t.column('type')
        .text()
        .in(...INVOICE_TYPES)
        .notNullable()
        .defaultTo(InvoiceType.ORDERS);

      t.column('user_id').text().defaultTo('system').notNullable();

      t.column('autopay_type')
        .text()
        .in(...AUTO_PAY_TYPES_VALUES);

      t.timestamps();
    })
    .createTable('orders', t => {
      t.column('id').integer().primary();

      t.column('business_line_id').integer().references('business_lines');

      t.column('invoice_id').integer().references('invoices');
      t.column('customer_id').integer().notNullable().references('customers');
      t.column('job_site_id').integer().notNullable().references('job_sites');
      t.column('customer_job_site_id').integer().notNullable().references('customer_job_site');

      t.column('before_taxes_total').numeric().notNullable();
      t.column('grand_total').numeric().notNullable();
      t.column('captured_total').numeric().notNullable().defaultTo(0);

      t.column('service_date').date().notNullable();
      t.column('invoice_notes').text();

      t.column('payment_method')
        .text()
        .in(...PAYMENT_METHODS);

      t.column('wo_number').integer();
      t.column('ticket_url').text();
      t.column('ticket').text();

      t.column('refunded_total').numeric().notNullable().defaultTo(0);
      t.column('on_account_total').numeric().notNullable().defaultTo(0);
      t.column('override_credit_limit').boolean().notNullable().defaultTo(false);

      t.column('surcharges_total').numeric().notNullable().defaultTo(0);

      t.timestamps();
    })
    .createTable('order_line_items', t => {
      t.column('id').integer().identity();

      t.column('order_id').integer().notNullable().references('orders');

      t.column('description').text().notNullable();
      t.column('total').numeric().notNullable();
      t.column('quantity').numeric().notNullable();

      t.column('billable_service_historical_id').integer();
      t.column('billable_line_item_historical_id').integer();

      t.column('price').numeric().notNullable();
      t.column('is_service').boolean().notNullable().defaultTo(false);

      t.timestamps();
    })
    .createTable('payments', t => {
      t.column('id').integer().identity();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('credit_card_id').integer().references('credit_cards');

      t.column('status')
        .text()
        .in(...PAYMENT_STATUSES)
        .notNullable();
      t.column('date').date().notNullable();
      t.column('payment_type')
        .text()
        .in(...PAYMENT_TYPES)
        .notNullable();

      t.column('amount').numeric().notNullable();
      t.column('send_receipt').boolean().notNullable().defaultTo(false);
      t.column('cc_retref').text();
      t.column('check_number').text();
      t.column('is_ach').boolean().defaultTo(false).notNullable();
      t.column('memo_note').text();

      t.column('prev_balance').numeric().defaultTo(0).notNullable();
      t.column('applied_amount').numeric().defaultTo(0).notNullable();
      t.column('paid_out_amount').numeric().defaultTo(0).notNullable();
      t.column('reversed_amount').numeric().notNullable().defaultTo(0);

      t.column('refunded_amount').numeric().notNullable().defaultTo(0);
      t.column('refunded_on_account_amount').numeric().notNullable().defaultTo(0);

      t.column('deferred_until').date();
      t.column('write_off_note').text();
      t.column('canceled').boolean().notNullable().defaultTo(false);

      t.column('billable_item_type')
        .text()
        .in(...BILLABLE_ITEM_TYPES);
      t.column('billable_item_id').integer();

      t.column('user_id').text().defaultTo('system').notNullable();

      t.column('is_prepay').boolean().defaultTo(true).notNullable();

      t.column('invoiced_status')
        .text()
        .notNullable()
        .in(...PAYMENT_INVOICED_STATUSES)
        .generated(
          `case when reversed_amount > 0 then '${PaymentInvoicedStatus.REVERSED}'
                  when (amount - applied_amount - paid_out_amount - refunded_amount - refunded_on_account_amount) > 0 then '${PaymentInvoicedStatus.UNAPPLIED}'
                  else '${PaymentInvoicedStatus.APPLIED}' end`,
        );

      t.column('unapplied_amount')
        .numeric()
        .notNullable()
        .generated(
          '(amount - applied_amount - paid_out_amount - refunded_amount - refunded_on_account_amount)',
        );

      t.timestamps();
    })
    .createTable('media_files', t => {
      t.column('id').integer().identity();

      t.column('order_id').integer().references('orders');

      t.column('url').text().notNullable();
      t.column('file_name').text().notNullable();

      t.timestamps();
    })
    .createTable('settlements', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('merchant_id').integer().notNullable().references('merchants');

      t.column('date').date().notNullable();
      t.column('payment_gateway')
        .text()
        .in(...PAYMENT_GATEWAYS)
        .notNullable();

      t.column('fees').numeric().notNullable();
      t.column('adjustments').numeric().notNullable();
      t.column('pdf_url').text();

      t.column('count').integer().notNullable().defaultTo(0);
      t.column('amount').numeric().notNullable().defaultTo(0);

      t.column('net').numeric().generated('(amount - adjustments)');

      t.column('sp_used').boolean().notNullable().defaultTo(false);
      t.column('mid').text().notNullable();

      t.timestamps();
    })
    .createTable('payouts', t => {
      t.column('id').integer().identity();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('credit_card_id').integer().references('credit_cards');

      t.column('date').date().notNullable();
      t.column('payment_type')
        .text()
        .in(...PAYMENT_TYPES)
        .notNullable();

      t.column('amount').numeric().notNullable();

      t.column('cc_retref').text();
      t.column('check_number').text();
      t.column('is_ach').boolean().defaultTo(false).notNullable();

      t.column('prev_balance').numeric().notNullable();

      t.column('user_id').text().defaultTo('system').notNullable();

      t.timestamps();
    })
    .createTable('payment_applications', t => {
      t.column('id').integer().identity();

      t.column('payment_id').integer().notNullable().references('payments');
      t.column('invoice_id').integer().notNullable().references('invoices');
      t.unique(['invoice_id', 'payment_id']);

      t.column('amount').numeric().notNullable();
      t.column('prev_balance').numeric().notNullable();

      t.timestamps();
    })
    .createTable('settlement_transactions', t => {
      t.column('id').integer().identity();

      t.column('settlement_id')
        .integer()
        .notNullable()
        .references({ table: 'settlements', onDelete: 'cascade' });

      t.column('cc_retref').text().notNullable();
      t.column('amount').numeric().notNullable();
      t.column('fee').numeric().notNullable();
      t.column('adjustment').numeric().notNullable();
      t.column('transaction_note').text();

      t.timestamps();
    })
    .createTable('orders_payments', t => {
      t.column('id').integer().identity();

      t.column('payment_id').integer().notNullable().references('payments');
      t.column('order_id').integer().notNullable().references('orders');

      t.column('assigned_amount').numeric().notNullable().defaultTo(0);

      t.column('receipt_preview_url').text();
      t.column('receipt_pdf_url').text();

      t.timestamps();
    })
    .createTable('reverse_payments', t => {
      t.column('id').integer().identity();

      t.column('payment_id').integer().notNullable().references('payments');

      t.column('date').date().notNullable();
      t.column('note').text();
      t.column('type')
        .text()
        .in(...REVERSE_TYPES)
        .notNullable();

      // TODO: clarify if it can be different from payment amount
      t.column('amount').numeric().notNullable();

      t.timestamps();
    })
    .createTable('payout_applications', t => {
      t.column('id').integer().identity();

      t.column('payment_id').integer().notNullable().references('payments');
      t.column('payout_id').integer().notNullable().references('payouts');

      t.column('partial_amount').numeric().notNullable();

      t.timestamps();
    })
    .createTable('invoice_emails', t => {
      t.column('id').integer().identity();
      t.column('invoice_id').integer().notNullable().references('invoices');

      t.column('receiver').text();
      t.column('status')
        .text()
        .notNullable()
        .in(...EMAIL_EVENTS);

      t.timestamps();
    })
    .createTable('refund_payments', t => {
      t.column('id').integer().identity();

      t.column('payment_id').integer().notNullable().references('payments');
      t.column('on_account_payment_id').integer().references('payments');
      t.column('check_number').text();
      t.column('amount').numeric().notNullable();

      t.column('type')
        .text()
        .in(...REFUND_TYPES)
        .notNullable();

      t.timestamps();
    })
    .createTable('order_payments_historical', t => {
      t.column('id').integer().identity();

      t.column('event_type').text();
      t.column('user_id').text().notNullable().defaultTo('system');

      t.column('original_id').integer().notNullable(); // payment_id
      t.column('order_id').integer().notNullable();
      // from: orders_payments
      t.column('assigned_amount').numeric();

      // from: payments
      t.column('customer_id').integer();
      t.column('credit_card_id').integer();

      t.column('status').text();
      t.column('invoiced_status').text();
      t.column('date').date();
      t.column('payment_type').text();

      t.column('amount').numeric();
      t.column('send_receipt').boolean();
      t.column('cc_retref').text();
      t.column('check_number').text();
      t.column('is_ach').boolean();
      t.column('deferred_until').date();

      t.column('prev_balance').numeric();
      t.column('applied_amount').numeric();

      t.column('refunded_amount').numeric();
      t.column('refunded_on_account_amount').numeric();

      // from: payment_applications
      t.column('invoice_id').integer();
      t.column('invoiced_amount').numeric();

      // from: refund_payments
      t.column('on_account_payment_id').integer();
      t.column('refund_type').text();
      t.column('refund_check_number').text();
      t.column('refund_amount').numeric();

      t.timestamps();
    })
    .createTable('batch_statements', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().references('business_units');

      t.column('statement_date').date().notNullable();
      t.column('end_date').date().notNullable();

      t.column('total').numeric().notNullable();
      t.column('count').integer().notNullable();

      t.timestamps();
    })
    .createTable('statements', t => {
      t.column('id').integer().identity();

      t.column('batch_statement_id').integer().notNullable().references({
        table: 'batch_statements',
        onDelete: 'cascade',
      });

      t.column('customer_id').integer().notNullable().references('customers');

      t.column('statement_date').date().notNullable();
      t.column('end_date').date().notNullable();
      t.column('pdf_url').text();
      t.column('exago_path').text().notNullable();

      t.column('invoices_count').numeric().notNullable();
      t.column('invoices_total').numeric().notNullable();
      t.column('payments_total').numeric().notNullable();
      t.column('balance').numeric().notNullable();

      t.column('prev_balance').numeric().notNullable();
      t.column('prev_pdf_url').text();

      t.timestamps();
    })
    .createTable('statement_emails', t => {
      t.column('id').integer().identity();
      t.column('statement_id').integer().notNullable().references('statements');

      t.column('receiver').text().notNullable();
      t.column('status')
        .text()
        .notNullable()
        .in(...EMAIL_EVENTS);

      t.timestamps();
    })
    .createTable('bank_deposits', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('date').date().notNullable();
      t.column('deposit_type')
        .text()
        .in(...DEPOSIT_TYPES)
        .notNullable();
      t.column('merchant_id').text();
      t.column('count').integer().notNullable();
      t.column('synced').boolean().notNullable().defaultTo(false);
      t.column('status')
        .text()
        .in(...DEPOSIT_STATUSES)
        .notNullable();
      t.column('total').numeric().notNullable();

      t.column('settlement_id').integer().references({ table: 'settlements', onDelete: 'cascade' });
      t.column('adjustments').numeric().notNullable().defaultTo(0);

      t.column('pdf_url').text();

      t.timestamps();
    })
    .createTable('bank_deposit_payment', t => {
      t.column('id').integer().identity();

      t.column('bank_deposit_id').integer().notNullable().references({
        table: 'bank_deposits',
        onDelete: 'cascade',
      });

      t.column('payment_id').integer().notNullable().references({ table: 'payments' });

      t.timestamps();
    })
    .createTable('credit_card_job_site', t => {
      t.column('id').integer().identity();

      t.column('credit_card_id')
        .integer()
        .notNullable()
        .references({ table: 'credit_cards', onDelete: 'cascade' });
      t.column('job_site_id')
        .integer()
        .notNullable()
        .references({ table: 'job_sites', onDelete: 'cascade' });

      t.unique(['credit_card_id', 'job_site_id']);

      t.timestamps();
    })
    .createTable('finance_charges', t => {
      t.column('id').integer().identity();

      t.column('csr_email').text().notNullable();
      t.column('csr_name').text().notNullable();

      t.column('invoice_id').integer().notNullable().references('invoices');
      t.column('customer_id').integer().notNullable().references('customers');
      t.column('statement_id').integer().notNullable().references('statements');

      t.column('pdf_url').text();
      t.column('exago_path').text().notNullable();

      t.column('total').numeric().notNullable();
      t.column('balance').numeric().notNullable();
      t.column('finance_charge_apr').numeric().notNullable();

      t.column('write_off').boolean().notNullable().defaultTo(false);

      t.column('user_id').text().defaultTo('system').notNullable();

      t.timestamps();
    })
    .createTable('finance_charges_invoices', t => {
      t.column('id').integer().identity();
      t.column('finance_charge_id').integer().notNullable().references({
        table: 'finance_charges',
        onDelete: 'cascade',
      });
      t.column('invoice_id').integer().notNullable().references('invoices');
      t.column('to_date').date().notNullable();

      t.column('fine').numeric().notNullable();

      t.timestamps();
    })
    .createTable('finance_charge_emails', t => {
      t.column('id').integer().identity();
      t.column('finance_charge_id').integer().notNullable().references('finance_charges');

      t.column('receiver').text().notNullable();
      t.column('status')
        .text()
        .notNullable()
        .in(...EMAIL_EVENTS);

      t.timestamps();
    })
    .createTable('generation_jobs', t => {
      t.column('id').text().primary();

      t.column('expected_count').integer().notNullable();
      t.column('failed_count').integer().notNullable().defaultTo(0);
      t.column('count').integer().notNullable().defaultTo(0);
      t.column('status')
        .text()
        .notNullable()
        .in(...GENERATION_JOB_STATUSES);

      t.timestamps();
    })
    .createTable('invoice_generation_job', t => {
      t.column('id').integer().identity();

      t.column('invoice_id')
        .integer()
        .notNullable()
        .references({ table: 'invoices', onDelete: 'cascade' });

      t.column('generation_job_id').text().notNullable().references({
        table: 'generation_jobs',
        onDelete: 'cascade',
      });
    })
    .createTable('statement_generation_job', t => {
      t.column('id').integer().identity();

      t.column('statement_id')
        .integer()
        .notNullable()
        .references({ table: 'statements', onDelete: 'cascade' });

      t.column('generation_job_id').text().notNullable().references({
        table: 'generation_jobs',
        onDelete: 'cascade',
      });
    })
    .createTable('finance_charge_generation_job', t => {
      t.column('id').integer().identity();

      t.column('finance_charge_id').integer().notNullable().references({
        table: 'finance_charges',
        onDelete: 'cascade',
      });

      t.column('generation_job_id').text().notNullable().references({
        table: 'generation_jobs',
        onDelete: 'cascade',
      });
    })
    .createTable('statements_items', t => {
      t.column('id').integer().identity();
      t.column('statement_id')
        .integer()
        .notNullable()
        .references({ table: 'statements', onDelete: 'cascade' });
      t.column('invoice_id').integer().references('invoices');
      t.column('payment_id').integer().references('payments');
      t.column('payout_id').integer().references('payouts');
      t.column('payouts_count').integer();
      t.column('reverse_payment_id').integer().references('reverse_payments');
      t.column('refund_payment_id').integer().references('refund_payments');
      t.column('section')
        .text()
        .notNullable()
        .in(...STATEMENT_SECTIONS);

      t.timestamps();
    })
    .createTable('settlement_generation_job', t => {
      t.column('id').integer().identity();

      t.column('settlement_id')
        .integer()
        .notNullable()
        .references({ table: 'settlements', onDelete: 'cascade' });

      t.column('generation_job_id')
        .text()
        .notNullable()
        .references({ table: 'generation_jobs', onDelete: 'cascade' });
    })
    .createTable('business_unit_mail_settings', t => {
      t.column('id').integer().identity();

      t.column('admin_email').text();
      t.column('domain').text();
      t.column('business_unit_id').integer().notNullable().unique().references('business_units');

      t.column('statements_from').text();
      t.column('statements_reply_to').text();
      t.column('statements_send_copy_to').text();
      t.column('statements_subject').text();
      t.column('statements_body').text();

      t.column('invoices_from').text();
      t.column('invoices_reply_to').text();
      t.column('invoices_send_copy_to').text();
      t.column('invoices_subject').text();
      t.column('invoices_body').text();

      t.column('notification_emails').arrayOf('text');

      t.column('invoices_disclaimer_text').text();
      t.column('statements_disclaimer_text').text();

      t.column('services_from').text();
      t.column('services_reply_to').text();
      t.column('services_send_copy_to').text();
      t.column('services_subject').text();
      t.column('services_body').text();
      t.column('receipts_from').text();
      t.column('receipts_reply_to').text();
      t.column('receipts_send_copy_to').text();
      t.column('receipts_subject').text();
      t.column('receipts_body').text();
      t.column('receipts_disclaimer_text').text();

      t.timestamps();
    })
    .createTable('subscriptions', t => {
      t.column('id').integer().identity();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('job_site_id').integer().notNullable().references('job_sites');
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('billing_cycle')
        .text()
        .notNullable()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);
      t.column('billing_type')
        .text()
        .notNullable()
        .in(...BILLING_TYPES);

      t.column('anniversary_billing').boolean().defaultTo(false);

      t.column('start_date').date().notNullable();
      t.column('end_date').date();

      t.timestamps();
    })
    .createTable('subscriptions_invoices', t => {
      t.column('id').integer().identity();

      t.column('subscription_id').integer().notNullable().references('subscriptions');

      t.column('invoice_id').integer().notNullable().references('invoices');

      t.column('next_billing_period_from').date();
      t.column('next_billing_period_to').date();
      t.column('total_price_for_subscription').numeric().notNullable();

      t.timestamps();
    })
    .createTable('subscription_invoiced_entities', t => {
      t.column('id').integer().identity();

      t.column('entity_id').integer();
      t.column('type').text().notNullable();
      t.column('subscription_invoice_id')
        .integer()
        .notNullable()
        .references('subscriptions_invoices');
      t.column('service_name').text().notNullable();

      t.column('price').numeric();
      t.column('quantity').numeric();
      // price payed for this period of time [period_since, period_to]
      t.column('total_price').numeric();
      // usage day in all billing period
      t.column('total_day').numeric();
      // actual used
      t.column('usage_day').numeric();
      t.column('period_since').date();
      t.column('service_date').date();
      t.column('period_to').date();

      t.column('grand_total').numeric();

      t.column('index').integer().notNullable().defaultTo(0);
      t.column('second_index').integer().notNullable().defaultTo(0);
      t.column('sequence_id').text();

      t.timestamps();
    })
    .createTable('subscriptions_media', t => {
      t.column('id').uuid();
      t.primary('id');
      t.column('url').text().notNullable();
      t.column('file_name').text();

      t.column('subscription_id')
        .integer()
        .notNullable()
        .references({ table: 'subscriptions', onDelete: 'cascade' });

      t.timestamps();
    })
    .createTable('invoice_attachments', t => {
      t.column('id').integer().identity();

      t.column('invoice_id').integer().notNullable().references('invoices');

      t.column('url').text().notNullable();
      t.column('file_name').text().notNullable();
      t.timestamps();
    });

  await migrationBuilder.alterTable('business_units', t => {
    t.column('merchant_id').integer().references('merchants');
  });

  await migrationBuilder.raw(
    `create index customers_name_idx on ??.customers
        using gin (name gin_trgm_ops)`,
    [schema],
  );
  await migrationBuilder.raw('create index payments_date_index on payments (date desc)');
  await migrationBuilder.raw('create index payouts_date_index on payouts (date desc)');
  await migrationBuilder.raw('create index settlements_date_index on settlements (date desc)');
  await migrationBuilder.raw('create index bank_deposits_date_index on bank_deposits (date desc)');
};

export const down = (migrationBuilder, schema) => migrationBuilder.dropSchema(schema, true);
