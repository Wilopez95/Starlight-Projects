import { LOG_TYPES } from '../../../consts/qbLogTypes.js';
import {
  FINANCE_CHARGE_METHODS,
  FinanceChargeMethod,
} from '../../../consts/financeChargeMethod.js';
import { ACCOUNT_TYPES } from '../../../consts/qbAccountTypes.js';
import TENANT_NAME from '../../../consts/tenantName.js';
import { REGIONS } from '../../../consts/regions.js';
import { MEASUREMENT_UNITS, MEASUREMENT_UNIT } from '../../../consts/units.js';

const tenantsNameConstraint = 'tenants_name_check';

export const up = migrationBuilder =>
  migrationBuilder
    .createExtension('public', 'pg_trgm')
    .raw(
      `alter table ??.?? add constraint ?? check (?? ~ '${TENANT_NAME.toString()
        .slice(1, -1)
        .replace(/\?/g, '\\?')}')`,
      ['admin', 'tenants', tenantsNameConstraint, 'name'],
    )
    .alterTable('tenants', t => {
      t.column('region')
        .text()
        .in(...REGIONS)
        .notNullable();
    })
    .createTable('companies', t => {
      t.column('id').integer().identity();

      t.column('invoices_disclaimer_text').text();
      t.column('statements_disclaimer_text').text();

      t.column('tenant_id').integer().notNullable().unique().references('tenants');
      t.column('admin_email').text();
      t.column('logo_url').text();
      t.column('domain').text();

      t.column('physical_address_line_1').text();
      t.column('physical_address_line_2').text();
      t.column('physical_city').text();
      t.column('physical_state').text();
      t.column('physical_zip').text();

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

      t.column('time_zone_name').text().notNullable().defaultTo('UTC');

      t.column('finance_charge_method')
        .text()
        .notNullable()
        .in(...FINANCE_CHARGE_METHODS)
        .defaultTo(FinanceChargeMethod.DAYS);
      t.column('finance_charge_apr').numeric().notNullable().defaultTo(0);
      t.column('finance_charge_min_balance').numeric().notNullable().defaultTo(0);
      t.column('finance_charge_min_value').numeric().notNullable().defaultTo(0);

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

      t.column('unit')
        .text()
        .in(...MEASUREMENT_UNITS)
        .notNullable()
        .defaultTo(MEASUREMENT_UNIT.us);

      t.timestamps();
    })
    .createTable('quick_books_configuration', t => {
      t.column('id').integer().identity();

      t.column('tenant_id').integer().notNullable().unique().references('tenants');

      t.column('last_successful_integration').timestamptz().notNullable();
      t.column('date_to_adjustment').numeric().notNullable().defaultTo(3);
      t.column('password').text().notNullable();

      t.column('account_receivable').text();
      t.column('default_account_income(_credit)').text();
      t.column('default_account_tax(_credit)').text();
      t.column('default_payment_account').text();
      t.column('default_account_fin_charges(_credit)').text();
      t.column('writeoff_account(_debit)').text();
      t.column('credit_memo_account(_debit)').text();

      t.column('payment_account_cash').text();
      t.column('payment_account_check').text();
      t.column('payment_account_credit_card').text();

      t.column('integration_bu_list').arrayOf('integer');

      t.timestamps();
    })
    .createTable('quick_books_accounts', t => {
      t.column('id').integer().identity();

      t.column('configuration_id').integer().notNullable().references('quick_books_configuration');

      t.column('description').text();
      t.column('type')
        .text()
        .in(...ACCOUNT_TYPES)
        .notNullable();
      t.column('customer_group').text();
      t.column('customer_group_id').integer();
      t.column('account_name').text();
      t.column('district_type').text();

      t.timestamps();
    })
    .createTable('quick_books_integration_log', t => {
      t.column('id').integer().identity();

      t.column('configuration_id').integer().notNullable().references('quick_books_configuration');

      t.column('description').text();
      t.column('type')
        .text()
        .in(...LOG_TYPES)
        .notNullable();

      t.column('integration_bu_list').arrayOf('integer');
      t.column('last_successful_integration').date();
      t.column('date_to_adjustment').numeric();
      t.column('range_from').timestamptz();
      t.column('range_to').timestamptz();

      t.column('surcharges_total').numeric();
      t.column('payments_total').numeric();
      t.column('invoices_total').numeric();
      t.column('taxes_total').numeric();

      t.column('tenant_id').integer();
      t.column('fin_charges_total').numeric();
      t.column('write_offs_total').numeric();
      t.column('credit_memos_total').numeric();
      t.column('reversed_payments_total').numeric();
      t.column('adjustments_total').numeric();

      t.timestamps();
    });

export const down = migrationBuilder =>
  migrationBuilder
    .dropTable('companies')
    .raw('alter table ??.?? drop constraint if exists ??', [
      'admin',
      'tenants',
      tenantsNameConstraint,
    ])
    .dropTable('quick_books_accounts')
    .dropTable('quick_books_configuration');
