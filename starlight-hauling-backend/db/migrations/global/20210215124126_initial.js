import { DOMAIN_AUTHENTICATION_STATUSES } from '../../../consts/domainAuthenticationStatus.js';
import {
  FINANCE_CHARGE_METHODS,
  FINANCE_CHARGE_METHOD,
} from '../../../consts/financeChargeMethod.js';
import TENANT_NAME from '../../../consts/tenantName.js';
import { REGIONS } from '../../../consts/regions.js';
import { MEASUREMENT_UNITS } from '../../../consts/units.js';

const tenantsNameConstraint = 'tenants_name_check';

export const up = migrationBuilder =>
  migrationBuilder
    .createExtension('public', 'postgis')
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
    .createTable('admin', 'companies', t => {
      t.column('id').integer().identity();

      t.column('logo_url').text();
      t.column('company_name_line_1').text();
      t.column('company_name_line_2').text();
      t.column('official_website').text();
      t.column('official_email').text();
      t.column('phone').text();
      t.column('fax').text();

      t.column('physical_address_line_1').text();
      t.column('physical_address_line_2').text();
      t.column('physical_city').text();
      t.column('physical_state').text();
      t.column('physical_zip').text();

      t.column('mailing_address_line_1').text();
      t.column('mailing_address_line_2').text();
      t.column('mailing_city').text();
      t.column('mailing_state').text();
      t.column('mailing_zip').text();

      t.column('tenant_id').integer();
      t.foreign('tenant_id', {
        schema: 'admin',
        table: 'tenants',
        onDelete: 'cascade',
      });

      t.column('time_zone_name').text().notNullable().defaultTo('UTC');

      t.column('finance_charge_method')
        .text()
        .notNullable()
        .in(...FINANCE_CHARGE_METHODS)
        .defaultTo(FINANCE_CHARGE_METHOD.days);
      t.column('finance_charge_apr').numeric().notNullable().defaultTo(0);
      t.column('finance_charge_min_balance').numeric().notNullable().defaultTo(0);
      t.column('finance_charge_min_value').numeric().notNullable().defaultTo(0);

      t.column('clock_in').boolean().notNullable().defaultTo(false);

      t.column('unit')
        .text()
        .in(...MEASUREMENT_UNITS);

      t.unique('tenant_id');

      t.timestamps();
    })
    .createTable('admin', 'domains', t => {
      t.column('id').integer().identity();

      t.column('name').text().notNullable().unique();
      t.column('validation_status')
        .text()
        .notNullable()
        .in(...DOMAIN_AUTHENTICATION_STATUSES);

      t.column('tenant_id')
        .integer()
        .notNullable()
        .references({ table: 'tenants', onDelete: 'cascade' });

      t.timestamps();
    })
    .createTable('admin', 'company_mail_settings', t => {
      t.column('id').integer().identity();

      t.column('admin_email').text().notNullable();
      t.column('domain_id').integer().references('domains');
      t.column('tenant_id').integer().notNullable().unique().references('tenants');

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

      t.column('subscriptions_end_from').text();
      t.column('subscriptions_end_subject').text();
      t.column('subscriptions_end_body').text();
      t.column('subscriptions_resume_from').text();
      t.column('subscriptions_resume_subject').text();
      t.column('subscriptions_resume_body').text();

      t.column('weight_ticket_from').text();
      t.column('weight_ticket_reply_to').text();
      t.column('weight_ticket_send_copy_to').text();
      t.column('weight_ticket_subject').text();
      t.column('weight_ticket_body').text();
      t.column('weight_ticket_disclaimer_text').text();

      t.column('customer_on_hold_from').text();
      t.column('customer_on_hold_subject').text();
      t.column('customer_on_hold_body').text();

      t.timestamps();
    })
    .createTable('clock_in_out', t => {
      t.column('id').integer().identity();

      t.column('user_id').text().notNullable().defaultTo('system');

      t.column('clock_in').timestamp().notNullable();
      t.column('clock_out').timestamp();

      t.timestamps();
    })
    .createTable('admin', 'contractors', t => {
      t.column('id').integer().identity();

      t.column('tenant_id').integer().notNullable();
      t.foreign('tenant_id', {
        schema: 'admin',
        table: 'tenants',
        onDelete: 'cascade',
      });

      t.column('email').text().notNullable().unique();
      t.column('password').text().notNullable();

      t.column('last_login_at').timestamp();

      t.timestamps();
    });

export const down = migrationBuilder =>
  migrationBuilder
    .dropTable('admin', 'contractors')
    .dropTable('admin', 'clock_in_out')
    .dropTable('admin', 'company_mail_settings')
    .dropTable('admin', 'domains')
    .dropTable('admin', 'companies')
    .raw('alter table ??.?? drop constraint if exists ??', [
      'admin',
      'tenants',
      tenantsNameConstraint,
    ])
    .alterTable('admin.tenants', t => {
      t.dropColumn('region');
    })
    .dropExtension('postgis');
