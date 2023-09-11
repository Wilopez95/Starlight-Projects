/* eslint-disable max-lines */
import { BUSINESS_LINE_TYPES } from '../../../consts/businessLineTypes.js';
import { CUSTOMER_GROUP_TYPES } from '../../../consts/customerGroups.js';
import { BROKER_BILLINGS } from '../../../consts/brokerBillings.js';
import { LINE_ITEM_TYPES } from '../../../consts/lineItemTypes.js';
import { THRESHOLD_TYPES } from '../../../consts/thresholdTypes.js';
import { THRESHOLD_SETTINGS, THRESHOLD_SETTING } from '../../../consts/thresholdSettings.js';
import { ACTIONS } from '../../../consts/actions.js';
import {
  UNITS,
  LINE_ITEM_UNIT,
  LINE_ITEM_UNITS,
  THRESHOLD_UNITS,
  DISPOSAL_RATE_UNITS,
} from '../../../consts/units.js';
import { INVOICE_CONSTRUCTIONS } from '../../../consts/invoiceConstructions.js';
import { PRORATION_TYPE, PRORATION_TYPES } from '../../../consts/prorationTypes.js';
import {
  ORDER_REQUEST_STATUS,
  ORDER_REQUEST_STATUSES,
} from '../../../consts/orderRequestStatuses.js';
import {
  RECURRENT_TEMPLATE_FREQUENCY_TYPES,
  RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPES,
  RECURRENT_TEMPLATE_STATUSES,
} from '../../../consts/recurrentOrderTemplates.js';
import {
  BILLABLE_ITEMS_BILLING_CYCLES,
  BILLABLE_ITEMS_BILLING_CYCLE,
  BILLING_CYCLES_FREQUENCIES_SEED_DATA,
} from '../../../consts/billingCycles.js';
import { NOTIFICATION_TITLES } from '../../../consts/notifications.js';
import { PAYMENT_TERMS } from '../../../consts/paymentTerms.js';
import { APR_TYPES } from '../../../consts/aprTypes.js';
import { WAYPOINT_TYPES } from '../../../consts/waypointType.js';
import {
  ORDER_STATUSES,
  SUBSCRIPTION_ORDER_STATUSES,
  SUBSCRIPTION_ORDER_STATUS,
} from '../../../consts/orderStatuses.js';
import { REASON_TYPES } from '../../../consts/cancelReasons.js';
import { DISTRICT_TYPES } from '../../../consts/districtTypes.js';
import {
  WEIGHT_UNITS,
  WO_STATUSES,
  SUBSCRIPTION_WO_STATUSES,
  SUBSCRIPTION_WO_STATUS,
  WO_STATUS,
} from '../../../consts/workOrder.js';
import { TAX_CALCULATIONS, TAX_APPLICATIONS, TAX_TYPES } from '../../../consts/taxDistricts.js';
import { PHONE_TYPES } from '../../../consts/phoneTypes.js';
import { PAYMENT_METHODS, PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { EQUIPMENT_TYPES, EQUIPMENT_TYPE } from '../../../consts/equipmentTypes.js';
import { SUBSCRIPTION_STATUSES } from '../../../consts/subscriptionStatuses.js';
import { FREQUENCY_TYPES, FREQUENCIES_SEED_DATA } from '../../../consts/frequencyTypes.js';
import { NOTIFY_DAY_BEFORE_TYPES } from '../../../consts/notifyDayBefore.js';
import { BILLING_TYPES_VALUES } from '../../../consts/billingTypes.js';
import { BUSINESS_UNIT_TYPES, BUSINESS_UNIT_TYPE } from '../../../consts/businessUnitTypes.js';
import { initMediaTable } from '../../dbManagerFramework/helpers/media.js';
import { AUTO_PAY_TYPES } from '../../../consts/customerAutoPayTypes.js';
import { SURCHARGE_CALCULATIONS } from '../../../consts/surcharges.js';
import {
  INDEPENDENT_WO_STATUS,
  INDEPENDENT_WO_STATUSES,
} from '../../../consts/independentWorkOrder.js';
import { PAYMENT_GATEWAYS } from '../../../consts/paymentGateway.js';
// import { REMINDER_TYPES } from '../../../consts/reminderTypes.js';
import { LEVEL_APPLIED_VALUES } from '../../../consts/purchaseOrder.js';
import { SUBSCTIPTION_HISTORY_ACTIONS } from '../../../consts/subscriptionHistoryActions.js';
import { CUSTOMER_STATUS, CUSTOMER_STATUSES } from '../../../consts/customerStatuses.js';
import { DRIVER_LANGUAGES, DRIVER_LANGUAGES_VALUES } from '../../../consts/driverLanguage.js';
import { CHAT_STATUS, CHATS_STATUSES } from '../../../consts/chatStatuses.js';

const CUSTOMER_JOBSITE_PAIR_ID_PO_ID_UNIQUE = 'customer_jobsite_pair_id_purchase_order_id_unique';
const PURCHASE_ORDERS_CUSTOMER_ID_PO_NUMBER_UNIQUE = 'customer_id_purchase_order_number_unique';
const PRICE_ENTITY_TYPES = [
  'ONE_TIME_SERVICE',
  'RECURRING_SERVICE',
  'ONE_TIME_LINE_ITEM',
  'RECURRING_LINE_ITEM',
];
const UNIQUE_BUID_LOBID_IS_GENERAL = 'buid_lobid_is_general_unique';
const BILLING_TYPES = ['arrears', 'inAdvance'];

export const up = async (migrationBuilder, schema) => {
  const { knex } = migrationBuilder;

  await knex.raw('create extension if not exists "uuid-ossp"');
  await migrationBuilder.createSchema(schema);

  await migrationBuilder
    .createTable('job_sites', t => {
      t.column('id').integer().identity();

      t.column('contact_id').integer();
      t.column('media').arrayOf('text');

      t.addAddressFields();
      t.column('full_address').text().notNullable()
        .generated(`(address_line_1 || ' ' || coalesce(address_line_2 || ' ', '')
            || city || ' ' || state || ' ' || zip)`);

      t.column('location').pointGeography().notNullable();
      t.column('coordinates').arrayOf('numeric', 2);

      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('cab_over').boolean().notNullable().defaultTo(false);

      t.column('recycling_default').boolean().notNullable().defaultTo(false);

      t.column('radius').integer();
      t.column('polygon').geography();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('business_lines', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);

      t.column('name').text().notNullable();
      t.column('short_name').text().notNullable().defaultTo('');
      t.column('description').text();
      t.column('type')
        .text()
        .in(...BUSINESS_LINE_TYPES)
        .notNullable();

      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.timestamps();
    })
    .createTable('business_units', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('type')
        .text()
        .in(...BUSINESS_UNIT_TYPES)
        .notNullable()
        .defaultTo(BUSINESS_UNIT_TYPE.hauling);

      t.column('logo_url').text();
      t.column('name_line_1').text().notNullable();
      t.column('name_line_2').text();
      t.column('facility_address').text();
      t.column('website').text();
      t.column('email').text();
      t.column('phone').text().notNullable();
      t.column('fax').text();

      t.column('physical_address_line_1').text().notNullable();
      t.column('physical_address_line_2').text();
      t.column('physical_city').text().notNullable();
      t.column('physical_state').text().notNullable();
      t.column('physical_zip').text().notNullable();

      t.column('mailing_address_line_1').text().notNullable();
      t.column('mailing_address_line_2').text();
      t.column('mailing_city').text().notNullable();
      t.column('mailing_state').text().notNullable();
      t.column('mailing_zip').text().notNullable();

      t.column('time_zone_name').text();

      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);
      t.column('print_node_api_key').text();

      t.column('sp_used').boolean().notNullable().defaultTo(false);
      t.column('sp_business_line_id').integer().references('business_lines');

      t.column('require_destination_on_weight_out').boolean().notNullable().defaultTo(false);
      t.column('require_origin_of_inbound_loads').boolean().notNullable().defaultTo(false);

      t.column('job_site_id').integer().references('job_sites');

      t.timestamps();
    })
    .createTable('merchants', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('payment_gateway')
        .text()
        .notNullable()
        .in(...PAYMENT_GATEWAYS);

      t.column('mid').text();
      t.column('username').text();
      t.column('password').text();

      t.check(
        `("mid" is not null and "username" is not null and "password" is not null)
             or ("mid" is null and "username" is null and "password" is null)`,
      );

      t.check(
        `("salespoint_mid" is not null and "salespoint_username" is not null
            and "salespoint_password" is not null)
            or ("salespoint_mid" is null and "salespoint_username" is null
            and "salespoint_password" is null)`,
      );

      t.column('salespoint_mid').text();
      t.column('salespoint_username').text();
      t.column('salespoint_password').text();

      t.unique(['business_unit_id', 'payment_gateway']);

      t.timestamps();
    });

  await migrationBuilder.createTable('business_units_lines', t => {
    t.column('id').integer().identity();

    t.column('active').boolean().notNullable().defaultTo(true);

    t.column('business_unit_id').integer().notNullable().references('business_units');
    t.column('business_line_id').integer().notNullable().references('business_lines');

    t.column('billing_cycle')
      .text()
      .in(...BILLABLE_ITEMS_BILLING_CYCLES);
    t.column('billing_type')
      .text()
      .in(...BILLING_TYPES_VALUES);

    t.unique(['business_unit_id', 'business_line_id']);

    t.timestamps();
  });

  await migrationBuilder
    .createTable('customer_groups', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().unique().notNullable();
      t.column('type')
        .text()
        .in(...CUSTOMER_GROUP_TYPES)
        .notNullable();
      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('service_areas', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('name').text();
      t.column('description').text();
      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('geometry').geography().notNullable();

      t.unique(['business_unit_id', 'business_line_id', 'coalesce(name, null)'], {
        constraint: false,
      });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('permits', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('number').text().notNullable();
      t.column('expiration_date').date();

      t.unique(['business_unit_id', 'business_line_id', 'number']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('brokers', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('name').text().notNullable();
      t.column('email').text().unique().notNullable();
      t.column('short_name').text();
      t.column('billing')
        .text()
        .in(...BROKER_BILLINGS);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('equipment_items', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('type')
        .text()
        .in(...EQUIPMENT_TYPES)
        .notNullable();

      t.column('customer_owned').boolean().notNullable().defaultTo(false);

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('short_description').text().notNullable();

      t.column('size').numeric();
      t.column('length').numeric();
      t.column('width').numeric();
      t.column('height').numeric();
      t.column('empty_weight').numeric();

      t.column('closed_top').boolean().notNullable().defaultTo(false);

      t.column('image_url').text();

      t.unique(['business_line_id', 'description']);
      t.unique(['business_line_id', 'short_description']);

      t.column('recycling_default').boolean().notNullable().defaultTo(false);
      t.column('container_tare_weight_required').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('materials', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('code').text().unique();

      t.column('manifested').boolean().notNullable().defaultTo(false);
      t.column('recycle').boolean().notNullable().defaultTo(false);
      t.column('misc').boolean().notNullable().defaultTo(false);
      t.column('yard').boolean().notNullable().defaultTo(false);
      t.column('landfill_can_override').boolean().notNullable().defaultTo(false);
      t.column('use_for_load').boolean().notNullable().defaultTo(false);
      t.column('use_for_dump').boolean().notNullable().defaultTo(false);

      t.unique(['business_line_id', 'description']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('thresholds', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('type')
        .text()
        .in(...THRESHOLD_TYPES)
        .notNullable();

      t.column('description').text();

      t.column('unit')
        .text()
        .notNullable()
        .in(...THRESHOLD_UNITS);

      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);

      t.timestamps();

      t.unique(['business_line_id', 'type']);

      t.addHistoricalTable();
    })
    .createTable('global_thresholds_setting', t => {
      t.column('id').integer().identity();

      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('threshold_id')
        .integer()
        .notNullable()
        .references({ table: 'thresholds', onDelete: 'cascade' });

      t.column('setting')
        .text()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);

      t.unique(['threshold_id', 'business_line_id', 'business_unit_id']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('disposal_sites', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().unique().notNullable();

      t.column('waypoint_type')
        .text()
        .in(...WAYPOINT_TYPES);

      t.addAddressFields();

      t.column('location').pointGeography().notNullable();
      // TODO remove this
      t.column('coordinates').arrayOf('numeric', 2).notNullable();

      t.column('recycling').boolean().notNullable().defaultTo(false);
      t.column('recycling_tenant_name').text();
      t.column('business_unit_id').integer();

      t.column('has_storage').boolean().notNullable().defaultTo(false);
      t.column('has_weigh_scale').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('material_equipment_item', t => {
      t.primary(['material_id', 'equipment_item_id']);

      t.column('material_id').integer().notNullable();
      t.foreign('material_id', {
        table: 'materials',
        onDelete: 'cascade',
      });

      t.column('equipment_item_id').integer().notNullable();
      t.foreign('equipment_item_id', { table: 'equipment_items', onDelete: 'cascade' });

      t.timestamps();
    })
    .createTable('material_profiles', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('expiration_date').date();

      t.column('material_id')
        .integer()
        .notNullable()
        .references({ table: 'materials', onDelete: 'cascade' });
      t.column('disposal_site_id')
        .integer()
        .notNullable()
        .references({ table: 'disposal_sites', onDelete: 'cascade' });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('3rd_party_haulers', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('promos', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text();
      t.column('code').text().notNullable();
      t.column('start_date').date();
      t.column('end_date').date();
      t.column('note').text();

      t.unique(['business_line_id', 'business_unit_id', 'code']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('billable_services', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('allow_for_recurring_orders').boolean().notNullable().defaultTo(false);

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('one_time').boolean().notNullable().defaultTo(true);

      t.column('proration_type')
        .text()
        .in(...PRORATION_TYPES)
        .defaultTo(PRORATION_TYPE.servicesPerformed);

      t.column('equipment_item_id')
        .integer()
        .notNullable()
        .references({ table: 'equipment_items', onDelete: 'cascade' });

      t.column('action')
        .text()
        .in(...ACTIONS)
        .notNullable();

      t.column('unit')
        .text()
        .in(...UNITS)
        .notNullable();

      t.column('description').text().notNullable();

      t.column('import_codes').text();
      t.column('material_based').boolean().notNullable().defaultTo(false);

      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);
      t.column('material_based_pricing').boolean().notNullable().defaultTo(false);
      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.unique(['business_line_id', 'description']);

      t.addHistoricalTable();
    })
    .createTable('frequencies', t => {
      t.column('id').integer().identity();

      t.column('times').integer();
      t.column('type')
        .text()
        .in(...FREQUENCY_TYPES)
        .notNullable();
    })
    .createTable('billable_service_frequencies', t => {
      t.column('id').integer().identity();

      t.column('billable_service_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_services', onDelete: 'cascade' });
      t.column('frequency_id').integer().references('frequencies');

      t.unique(['billable_service_id', 'frequency_id']);

      t.timestamps();
    })
    .createTable('billable_services_include_services', t => {
      t.column('id').integer().identity();

      t.column('billable_service_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_services' });
      t.column('included_service_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_services' });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('billing_cycles_frequencies', t => {
      t.column('id').integer().identity();

      t.column('frequency_type')
        .text()
        .in(...FREQUENCY_TYPES)
        .notNullable();

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES)
        .notNullable();
    })
    .createTable('billable_service_billing_cycles', t => {
      t.column('id').integer().identity();

      t.column('billable_service_id').integer().notNullable().references('billable_services');
      t.column('billing_cycle')
        .text()
        .notNullable()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('billable_line_items', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('one_time').boolean().notNullable().defaultTo(true);
      t.column('material_based_pricing').boolean().notNullable().defaultTo(false);

      t.column('description').text().notNullable();
      t.column('type')
        .text()
        .in(...LINE_ITEM_TYPES);
      t.column('unit')
        .text()
        .notNullable()
        .in(...LINE_ITEM_UNITS)
        .defaultTo(LINE_ITEM_UNIT.each);

      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);

      t.timestamps();

      t.unique(['business_line_id', 'description']);

      t.addHistoricalTable();
    })
    .createTable('billable_line_item_billing_cycles', t => {
      t.column('id').integer().identity();

      t.column('billable_line_item_id').integer().notNullable().references('billable_line_items');
      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_services', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('billable_service_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_services', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.column('equipment_item_id')
        .integer()
        .notNullable()
        .references({ table: 'equipment_items', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'billable_service_id',
          "coalesce(material_id, '-1'::integer)",
          'equipment_item_id',
        ],
        {
          constraint: false,
          indexName: 'global_rates_services_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_recurring_services', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('billable_service_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_services', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.column('equipment_item_id')
        .integer()
        .notNullable()
        .references({ table: 'equipment_items', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'billable_service_id',
          "coalesce(material_id, '-1'::integer)",
          'equipment_item_id',
        ],
        {
          indexName: 'global_rates_recurring_services_billable_service_id_material_id',
          constraint: false,
        },
      );

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_recurring_service_frequency', t => {
      t.column('id').integer().identity();

      t.column('billable_service_frequency_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_service_frequencies', onDelete: 'cascade' });
      t.column('global_rate_recurring_service_id')
        .integer()
        .notNullable()
        .references('global_rates_recurring_services');

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES)
        .notNullable()
        .defaultTo(BILLABLE_ITEMS_BILLING_CYCLE.monthly);

      t.unique(
        ['global_rate_recurring_service_id', 'billable_service_frequency_id', 'billing_cycle'],
        {
          constraint: true,
          indexName: 'global_rates_recurring_service_frequency_bc_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_line_items', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('line_item_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_line_items', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'line_item_id',
          "coalesce(material_id, '-1'::integer)",
        ],
        {
          constraint: false,
          indexName: 'global_rates_line_items_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_recurring_line_items', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('line_item_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_line_items', onDelete: 'cascade' });

      t.unique(['business_line_id', 'business_unit_id', 'line_item_id']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_recurring_line_items_billing_cycle', t => {
      t.column('id').integer().identity();

      t.column('billable_line_item_billing_cycle_id').integer().notNullable().references({
        table: 'billable_line_item_billing_cycles',
        onDelete: 'cascade',
      });

      t.column('global_rates_recurring_line_item_id')
        .integer()
        .notNullable()
        .references('global_rates_recurring_line_items');

      t.unique(['billable_line_item_billing_cycle_id', 'global_rates_recurring_line_item_id'], {
        constraint: true,
        indexName: 'global_rates_recurring_line_item_billing_cycle_unique_constraint',
      });

      t.column('price').numeric().notNullable().defaultTo(0);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_thresholds', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('threshold_id').integer().notNullable().references({
        table: 'thresholds',
        onDelete: 'cascade',
      });

      t.column('equipment_item_id')
        .integer()
        .references({ table: 'equipment_items', onDelete: 'cascade' });

      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'threshold_id',
          "coalesce(material_id, '-1'::integer)",
          "coalesce(equipment_item_id, '-1'::integer)",
        ],
        {
          constraint: false,
          indexName: 'global_rates_thresholds_unique',
        },
      );

      t.column('limit').numeric();
      t.column('price').numeric().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('contacts', t => {
      t.column('id').integer().identity();

      t.column('customer_id').integer();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('main').boolean().notNullable().defaultTo(false);
      t.column('allow_contractor_app').boolean().notNullable().defaultTo(false);

      t.column('first_name').text().notNullable();
      t.column('last_name').text().notNullable();
      t.column('job_title').text();
      t.column('email').text();

      t.column('allow_customer_portal').boolean().notNullable().defaultTo(false);
      t.column('customer_portal_user').boolean().notNullable().defaultTo(false);
      t.unique(['email', 'customer_id'], { indexName: 'contacts_email_customer_id_unique' });

      t.timestamps();

      t.index(['customer_id']);

      t.addHistoricalTable();
    })
    .createTable('customers', t => {
      t.column('id').integer().identity();

      t.column('customer_group_id')
        .integer()
        .notNullable()
        .references({ table: 'customer_groups', onDelete: 'restrict' });
      t.column('business_unit_id').integer().references('business_units').notNullable();

      t.column('email').text();

      t.column('signature_required').boolean().notNullable().defaultTo(false);
      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('business_name').text();
      t.column('first_name').text();
      t.column('last_name').text();

      t.column('contact_id')
        .integer()
        .notNullable()
        .references({ table: 'contacts', onDelete: 'restrict' });

      t.column('name').text().generated(`coalesce(business_name, first_name || ' ' || last_name)`);
      t.check('name is not null');

      t.column('alternate_id').text();

      t.column('owner_id').integer().references('brokers');
      t.column('sales_id').text();

      t.column('invoice_construction')
        .text()
        .in(...INVOICE_CONSTRUCTIONS)
        .notNullable();
      t.column('on_account').boolean().notNullable().defaultTo(false);
      t.column('credit_limit').numeric().notNullable().defaultTo(0);
      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);
      t.column('payment_terms')
        .text()
        .in(...PAYMENT_TERMS);
      t.column('balance').numeric().defaultTo(0).notNullable();
      t.column('add_finance_charges').boolean().notNullable().defaultTo(false);
      t.column('apr_type')
        .text()
        .in(...APR_TYPES);
      t.column('finance_charge').numeric();

      t.addAddressFields('mailing');
      t.column('full_mailing_address').text().notNullable()
        .generated(`(mailing_address_line_1 || ' '
            || coalesce(mailing_address_line_2 || ' ', '')
            || mailing_city || ' ' || mailing_state || ' ' || mailing_zip)`);

      t.addAddressFields('billing');
      t.column('full_billing_address').text().notNullable()
        .generated(`(billing_address_line_1 || ' '
            || coalesce(billing_address_line_2 || ' ', '')
            || billing_city || ' ' || billing_state || ' ' || billing_zip)`);

      t.column('send_invoices_by_post').boolean().notNullable().defaultTo(false);
      t.column('send_invoices_by_email').boolean().notNullable().defaultTo(true);
      t.column('attach_ticket_pref').boolean().notNullable().defaultTo(false);
      t.column('attach_media_pref').boolean().notNullable().defaultTo(false);
      t.column('invoice_emails').arrayOf('text');
      t.column('statement_emails').arrayOf('text');
      t.column('notification_emails').arrayOf('text');

      t.column('general_note').text();
      t.column('popup_note').text();

      t.column('status')
        .text()
        .notNullable()
        .in(...CUSTOMER_STATUSES)
        .defaultTo(CUSTOMER_STATUS.active);
      t.column('is_autopay_exist').boolean().notNullable().defaultTo(false);
      t.column('autopay_type')
        .text()
        .in(...AUTO_PAY_TYPES);
      t.column('billing_note').text();

      t.column('work_order_required').boolean().notNullable().defaultTo(false);
      t.column('job_site_required').boolean().notNullable().defaultTo(false);
      t.column('can_tare_weight_required').boolean().notNullable().defaultTo(true);
      t.column('grading_required').boolean().notNullable().defaultTo(true);
      t.column('grading_notification').boolean().notNullable().defaultTo(true);
      t.column('self_service_order_allowed').boolean().notNullable().defaultTo(false);
      t.column('walkup').boolean().notNullable().defaultTo(false);
      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.index(['business_unit_id', 'name']);

      t.addHistoricalTable();
    })
    .createTable('customer_comments', t => {
      t.column('id').integer().identity();

      t.column('customer_id')
        .integer()
        .notNullable()
        .references({ table: 'customers', onDelete: 'cascade' });
      t.column('author_id').text().notNullable().defaultTo('system');

      t.column('content').text().notNullable();

      t.timestamps();
    })
    .createTable('customer_job_site', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);

      t.column('job_site_id')
        .integer()
        .notNullable()
        .references({ table: 'job_sites', onDelete: 'cascade' });
      t.column('customer_id')
        .integer()
        .notNullable()
        .references({ table: 'customers', onDelete: 'cascade' });

      t.column('popup_note').text();
      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('permit_required').boolean().notNullable().defaultTo(false);
      t.column('signature_required').boolean().notNullable().defaultTo(false);
      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('cab_over').boolean().notNullable().defaultTo(false);

      t.column('send_invoices_to_job_site').boolean().notNullable().defaultTo(false);
      t.column('invoice_emails').arrayOf('text');

      t.unique(['job_site_id', 'customer_id']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('phone_numbers', t => {
      t.column('id').integer().identity();

      t.column('contact_id').integer().references({ table: 'contacts', onDelete: 'cascade' });
      t.column('user_id').text();
      t.column('customer_id').integer().references({ table: 'customers', onDelete: 'cascade' });

      t.column('type')
        .text()
        .notNullable()
        .in(...PHONE_TYPES);
      t.column('number').text().notNullable();
      t.column('extension').text();
      t.column('text_only').boolean().notNullable().defaultTo(false);

      t.index(['customer_id']);
      t.index(['contact_id']);

      t.timestamps();
    })
    .createTable('purchase_orders', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable();
      t.column('po_number').text().notNullable();
      t.column('effective_date').date();
      t.column('expiration_date').date();
      t.column('po_amount').numeric();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('is_one_time').boolean().notNullable().defaultTo(false);
      t.column('is_default_by_customer').boolean().notNullable().defaultTo(false);
      t.column('level_applied')
        .arrayOf('text', LEVEL_APPLIED_VALUES.length)
        .notNullable()
        .defaultTo('{}');

      t.check(`level_applied <@ ARRAY[${LEVEL_APPLIED_VALUES.map(item => `'${item}'::text`)}]`);

      t.unique(['customer_id', 'po_number'], {
        constraint: true,
        indexName: PURCHASE_ORDERS_CUSTOMER_ID_PO_NUMBER_UNIQUE,
      });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('purchase_orders_business_lines', t => {
      t.column('id').integer().identity();

      t.column('purchase_order_id').integer().notNullable().references('purchase_orders');
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.timestamps();

      t.unique(['purchase_order_id', 'business_line_id']);
    })
    .createTable('tax_district_taxes', t => {
      t.column('id').integer().identity();

      t.column('calculation')
        .text()
        .notNullable()
        .in(...TAX_CALCULATIONS);
      t.column('application')
        .text()
        .in(...TAX_APPLICATIONS);
      t.column('group').boolean().notNullable();
      t.column('value').numeric();

      t.check('("group" and "value" is not null) or (not "group" and "value" is null)');
    })
    .createTable('tax_districts', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable().unique();
      t.column('tax_description').text();
      t.column('district_code').text().unique();
      t.column('district_name').text();
      t.column('district_type')
        .text()
        .in(...DISTRICT_TYPES);

      t.column('bbox').type('box2d');
      t.column('business_line_taxes_ids').arrayOf('integer');

      t.column('include_national_in_taxable_amount').boolean().notNullable().defaultTo(false);
      t.column('taxes_per_customer_type').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('tax_district_group_taxes_recurring_service_exclusions', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('recurring_service_id').integer().notNullable().references('billable_services');
    })
    .createTable('tax_district_group_taxes_recurring_line_item_exclusions', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('recurring_line_item_id').integer().notNullable().references('billable_line_items');
    })
    .createTable('tax_district_non_group_recurring_service_taxes', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('recurring_service_id').integer().notNullable().references('billable_services');

      t.column('value').numeric().notNullable();
    })
    .createTable('tax_district_non_group_recurring_line_item_taxes', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('recurring_line_item_id').integer().notNullable().references('billable_line_items');

      t.column('value').numeric().notNullable();
    })
    .createTable('tax_districts_business_line_taxes', t => {
      t.column('id').integer().identity();

      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('commercial_service_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('commercial_material_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('commercial_line_item_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('commercial_recurring_service_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('commercial_recurring_line_item_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');

      t.column('non_commercial_service_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('non_commercial_material_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('non_commercial_line_item_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('non_commercial_recurring_service_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');
      t.column('non_commercial_recurring_line_item_taxes_id')
        .integer()
        .notNullable()
        .references('tax_district_taxes');

      t.timestamps();
    })
    .createTable('tax_district_group_taxes_material_exclusions', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('material_id').integer().notNullable().references('materials');
    })
    .createTable('tax_district_group_taxes_service_exclusions', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('service_id').integer().notNullable().references('billable_services');
    })
    .createTable('tax_district_group_taxes_line_item_exclusions', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('line_item_id').integer().references('billable_line_items');
      t.column('threshold_id').integer().references('thresholds');
    })
    .createTable('tax_district_non_group_material_taxes', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('material_id').integer().notNullable().references('materials');

      t.column('value').numeric().notNullable();
    })
    .createTable('tax_district_non_group_service_taxes', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().notNullable().references('tax_district_taxes');
      t.column('service_id').integer().notNullable().references('billable_services');

      t.column('value').numeric().notNullable();
    })
    .createTable('tax_district_non_group_line_item_taxes', t => {
      t.column('id').integer().identity();

      t.column('tax_district_taxes_id').integer().references('tax_district_taxes');
      t.column('line_item_id').integer().references('billable_line_items');
      t.column('threshold_id').integer().references('thresholds');

      t.column('value').numeric().notNullable();
    })
    .createTable('customer_job_site_pair_tax_districts', t => {
      t.column('id').integer().identity();
      t.column('tax_district_id').integer().notNullable().references('tax_districts');
      t.column('customer_job_site_pair_id').integer().notNullable().references('customer_job_site');

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('job_site_default_tax_districts', t => {
      t.column('id').integer().identity();
      t.column('job_site_id').integer().references('job_sites').notNullable();
      t.column('tax_district_id').integer().references('tax_districts').notNullable();

      t.unique(['job_site_id', 'tax_district_id']);

      t.timestamps();
    })
    .createTable('job_site_virtual_tax_districts', t => {
      t.column('id').integer().identity();
      t.column('job_site_id').integer().references('job_sites').notNullable();
      t.column('tax_district_code').text().notNullable();

      t.unique(['job_site_id', 'tax_district_code']);

      t.timestamps();
    })
    .createTable('custom_rates_groups', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('start_date').date();
      t.column('end_date').date();
      t.column('valid_days').arrayOf('integer', 7).notNullable();

      t.column('overweight_setting')
        .text()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);
      t.column('usage_days_setting')
        .text()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);
      t.column('demurrage_setting')
        .text()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);

      t.column('customer_group_id')
        .integer()
        .references({ table: 'customer_groups', onDelete: 'cascade' });
      t.column('customer_id').integer().references({ table: 'customers', onDelete: 'cascade' });
      t.column('customer_job_site_id')
        .integer()
        .references({ table: 'customer_job_site', onDelete: 'cascade' });

      t.column('dump_setting')
        .text()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.material);
      t.column('load_setting')
        .text()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.material);

      t.column('non_service_hours').boolean().notNullable().defaultTo(false);
      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.unique(['business_line_id', 'business_unit_id', 'description']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('service_areas_custom_rates_groups', t => {
      t.column('id').integer().identity();

      t.column('service_area_id').integer().notNullable().references({ table: 'service_areas' });
      t.column('custom_rates_group_id')
        .integer()
        .notNullable()
        .references({ table: 'custom_rates_groups' });

      t.unique(['service_area_id', 'custom_rates_group_id']);

      t.timestamps();
    })
    .createTable('custom_rates_group_services', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('custom_rates_group_id')
        .integer()
        .notNullable()
        .references({ table: 'custom_rates_groups', onDelete: 'cascade' });
      t.column('billable_service_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_services', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });
      t.column('equipment_item_id')
        .integer()
        .notNullable()
        .references({ table: 'equipment_items', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'custom_rates_group_id',
          'billable_service_id',
          "coalesce(material_id, '-1'::integer)",
          'equipment_item_id',
        ],
        {
          constraint: false,
          indexName: 'custom_rates_group_services_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.column('effective_date').date();
      t.column('next_price').numeric();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('custom_rates_group_recurring_service_frequency', t => {
      t.column('id').integer().identity();

      t.column('billable_service_frequency_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_service_frequencies', onDelete: 'cascade' });
      t.column('custom_rates_group_recurring_service_id')
        .integer()
        .notNullable()
        .references('custom_rates_group_services');

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES)
        .notNullable()
        .defaultTo(BILLABLE_ITEMS_BILLING_CYCLE.monthly);

      t.unique(
        [
          'custom_rates_group_recurring_service_id',
          'billable_service_frequency_id',
          'billing_cycle',
        ],
        {
          constraint: true,
          indexName: 'custom_rates_group_recurring_service_freq_bc_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.column('effective_date').date();
      t.column('next_price').numeric();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('custom_rates_group_line_items', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('one_time').boolean().notNullable().defaultTo(true);
      t.column('custom_rates_group_id')
        .integer()
        .notNullable()
        .references({ table: 'custom_rates_groups', onDelete: 'cascade' });

      t.column('line_item_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_line_items', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'custom_rates_group_id',
          'line_item_id',
          "coalesce(material_id, '-1'::integer)",
        ],
        {
          constraint: false,
          indexName: 'custom_rates_group_line_items_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.column('effective_date').date();
      t.column('next_price').numeric();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('custom_rates_group_recurring_line_item_billing_cycle', t => {
      t.column('id').integer().identity();

      t.column('billable_line_item_billing_cycle_id').integer().notNullable().references({
        table: 'billable_line_item_billing_cycles',
        onDelete: 'cascade',
      });

      t.column('custom_rates_group_recurring_line_item_id')
        .integer()
        .notNullable()
        .references('custom_rates_group_line_items');

      t.unique(
        ['billable_line_item_billing_cycle_id', 'custom_rates_group_recurring_line_item_id'],
        {
          constraint: true,
          indexName: 'custom_rates_group_recurring_line_item_billing_cycle_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.column('effective_date').date();
      t.column('next_price').numeric();

      t.timestamps();

      t.addHistoricalTable({
        identityConstraintName: 'custom_rates_group_recurring_line_item_billing_cycle_hist_pk',
      });
    })
    .createTable('custom_rates_group_thresholds', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('custom_rates_group_id')
        .integer()
        .notNullable()
        .references({ table: 'custom_rates_groups', onDelete: 'cascade' });
      t.column('threshold_id')
        .integer()
        .notNullable()
        .references({ table: 'thresholds', onDelete: 'cascade' });
      t.column('equipment_item_id')
        .integer()
        .references({ table: 'equipment_items', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'custom_rates_group_id',
          'threshold_id',
          "COALESCE(material_id, '-1'::integer)",
          "COALESCE(equipment_item_id, '-1'::integer)",
        ],
        {
          constraint: false,
          indexName: 'custom_rates_group_thresholds_unique',
        },
      );

      t.column('limit').numeric();
      t.column('price').numeric();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('projects', t => {
      t.column('id').integer().identity();

      t.column('customer_job_site_id')
        .integer()
        .notNullable()
        .references({ table: 'customer_job_site', onDelete: 'cascade' });

      t.column('generated_id').text().notNullable().unique();
      t.column('description').text().notNullable().unique();

      t.column('start_date').date();
      t.column('end_date').date();

      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('permit_required').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('truck_types', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().unique().notNullable();

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('trucks', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('license_plate').text().notNullable();
      t.column('note').text();
      t.column('location').pointGeography();

      t.column('truck_type_id').integer().notNullable().references('truck_types');

      t.timestamps();
      t.addHistoricalTable();
    })

    .createTable('drivers', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('photo_url').text();
      t.column('phone').text();
      t.column('email').text().notNullable();
      t.column('license_number').text().notNullable();
      t.column('license_type').text().notNullable();
      t.column('license_validity_date').date().notNullable();
      t.column('medical_card_validity_date').date();
      t.column('working_weekdays').arrayOf('integer', 7).notNullable();

      t.column('language')
        .text()
        .in(...DRIVER_LANGUAGES_VALUES)
        .defaultTo(DRIVER_LANGUAGES.en);
      t.column('device_token').text();

      t.column('truck_id').integer().references('trucks');

      t.unique(['email']);

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('work_orders', t => {
      t.column('id').integer().identity();

      t.column('business_line_id').integer();

      t.column('wo_number').integer();
      t.column('status')
        .text()
        .in(...WO_STATUSES)
        .defaultTo(WO_STATUS.inProgress);

      t.column('route').text();
      t.column('completion_date').date();
      t.column('finish_work_order_date').timestamp();

      t.column('driver_id').integer().references('drivers');
      t.column('truck_id').integer().references('trucks');
      t.column('truck').text();
      t.column('dropped_equipment_item').text();
      t.column('dropped_equipment_item_date').timestamp();
      t.column('picked_up_equipment_item').text();
      t.column('picked_up_equipment_item_date').timestamp();

      t.column('dropped_equipment_item_id').integer();
      t.column('picked_up_equipment_item_id').integer();

      t.column('weight').numeric();
      t.column('weight_unit')
        .text()
        .in(...WEIGHT_UNITS);

      t.column('start_work_order_date').timestamp();
      t.column('arrive_on_site_date').timestamp();
      t.column('start_service_date').timestamp();
      t.column('going_to_fill_date').timestamp();

      t.column('ticket').text();
      t.column('ticket_url').text();
      t.column('ticket_date').timestamp();
      t.column('ticket_author').text();
      t.column('ticket_from_csr').boolean().notNullable().defaultTo(false);

      t.column('driver_notes').text();

      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('driver_instructions').text();
      t.column('early_pick').boolean();
      t.column('to_roll').boolean();
      t.column('call_on_way_phone_number').text();
      t.column('text_on_way_phone_number').text();
      t.column('someone_on_site').boolean();
      t.column('high_priority').boolean();

      t.column('alley_placement').boolean().defaultTo(false);
      t.column('cab_over').boolean().defaultTo(false);
      t.column('signature_required').boolean().defaultTo(false);

      t.column('media_urls').arrayOf('text');

      t.column('sync_date').timestamp();

      t.timestamps();

      t.index(['wo_number'], {
        unique: true,
        indexName: 'work_orders_wo_number_unique',
        predicate: 'wo_number is not null and wo_number != -1',
      });

      t.addHistoricalTable();
    })
    .createTable('media_files', t => {
      t.column('id').integer().identity();
      t.column('work_order_id').integer().notNullable().references('work_orders');

      t.column('url').text().notNullable();
      t.column('timestamp').timestamp();
      t.column('author').text();
      t.column('file_name').text();
      t.column('dispatch_id').integer();

      t.timestamps();

      t.index(['work_order_id']);

      t.addHistoricalTable();
    })
    .createTable('order_requests', t => {
      t.column('id').integer().identity();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('contractor_id').integer().notNullable(); // .references('contractors');

      t.column('status')
        .text()
        .in(...ORDER_REQUEST_STATUSES)
        .notNullable()
        .defaultTo(ORDER_REQUEST_STATUS.requested);

      t.column('job_site_id').integer().notNullable(); // .references('job_sites');
      t.column('job_site_2_id').integer(); // .references('job_sites');

      // .references('billable_services')
      t.column('billable_service_id').integer().notNullable();
      t.column('equipment_item_id').integer(); // .references('equipment_items');
      t.column('material_id').integer().notNullable(); // .references('materials');

      t.column('service_date').date().notNullable();

      t.column('billable_service_price').numeric().notNullable();
      t.column('billable_service_quantity').numeric().notNullable().defaultTo(1);
      t.column('billable_service_total').numeric();

      t.column('initial_grand_total').numeric();
      t.column('grand_total').numeric();

      t.column('media_urls').arrayOf('text');
      t.column('driver_instructions').text(); // placementInstructions
      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('someone_on_site').boolean().notNullable().defaultTo(false);

      t.column('send_receipt').boolean().notNullable().defaultTo(false);
      t.column('payment_method')
        .text()
        .in(...PAYMENT_METHODS);
      t.column('credit_card_id').integer();
      t.column('purchase_order_id').integer().references('purchase_orders');

      t.column('service_area_id').integer(); // .references('service_areas');

      t.column('refactored_billable_service_price').bigint();
      t.column('refactored_billable_service_total').bigint();
      t.column('refactored_initial_grand_total').bigint();
      t.column('refactored_grand_total').bigint();

      t.index(['status']);

      t.timestamps();
    })
    .createTable('independent_work_orders', t => {
      t.column('id').integer().identity();

      t.column('business_line_id').integer();

      t.column('wo_number').integer();
      t.column('status')
        .text()
        .in(...INDEPENDENT_WO_STATUSES)
        .defaultTo(INDEPENDENT_WO_STATUS.scheduled);

      t.column('route').text();
      t.column('completion_date').date();
      t.column('finish_work_order_date').timestamp();

      t.column('truck').text();
      t.column('dropped_equipment_item_date').timestamp();
      t.column('picked_up_equipment_item_date').timestamp();
      t.column('picked_up_equipment_item').text();
      t.column('dropped_equipment_item').text();

      t.column('weight').numeric();
      t.column('weight_unit')
        .text()
        .in(...WEIGHT_UNITS);

      t.column('start_work_order_date').timestamp();
      t.column('arrive_on_site_date').timestamp();
      t.column('start_service_date').timestamp();

      t.column('driver_notes').text();

      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('driver_instructions').text();
      t.column('to_roll').boolean();
      t.column('call_on_way_phone_number').text();
      t.column('text_on_way_phone_number').text();
      t.column('someone_on_site').boolean();
      t.column('alley_placement').boolean();
      t.column('signature_required').boolean();
      t.column('high_priority').boolean();

      t.column('last_failure_date').date();
      t.column('sync_date').timestamp();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('price_groups', t => {
      t.column('id').integer().identity();

      t.column('is_general').boolean().notNullable().defaultTo(false);
      t.column('description').text().notNullable();
      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('service_areas_ids').arrayOf('integer').notNullable().defaultTo('{}');
      t.column('customer_group_id').integer().defaultTo(null);
      t.column('customer_id').integer().defaultTo(null);
      t.column('customer_job_site_id').integer().defaultTo(null);

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('valid_days').arrayOf('integer').notNullable().defaultTo('{}');

      t.column('overweight_setting')
        .text()
        .notNullable()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);
      t.column('usage_days_setting')
        .text()
        .notNullable()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);
      t.column('demurrage_setting')
        .text()
        .notNullable()
        .in(...THRESHOLD_SETTINGS)
        .defaultTo(THRESHOLD_SETTING.global);

      t.column('dump_setting')
        .text()
        .notNullable()
        .in(THRESHOLD_SETTING.material)
        .defaultTo(THRESHOLD_SETTING.material);
      t.column('load_setting')
        .text()
        .notNullable()
        .in(THRESHOLD_SETTING.material)
        .defaultTo(THRESHOLD_SETTING.material);
      t.column('non_service_hours').boolean().notNullable().defaultTo(false);

      t.column('start_at').timestampnotz().notNullable().defaultTo(knex.fn.now());
      t.column('end_at').timestampnotz().defaultTo(null);

      t.column('sp_used').boolean().notNullable().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('prices', t => {
      t.column('id').integer().identity();

      t.column('price_group_id').integer().notNullable().references('price_groups');
      t.column('entity_type')
        .text()
        .in(...PRICE_ENTITY_TYPES)
        .notNullable()
        .defaultTo(null);

      t.column('billable_service_id').integer().defaultTo(null);
      t.column('billable_line_item_id').integer().defaultTo(null);
      t.column('equipment_item_id').integer().defaultTo(null);
      t.column('material_id').integer().defaultTo(null);
      t.column('threshold_id').integer().defaultTo(null);
      t.column('surcharge_id').integer().defaultTo(null);

      t.column('billing_cycle')
        .text()

        .in(...BILLABLE_ITEMS_BILLING_CYCLES)
        .defaultTo(null);
      t.column('frequency_id')
        .integer()

        .defaultTo(null);

      t.column('price').bigint().notNullable();
      t.column('next_price').bigint();
      t.column('limit').numeric();

      t.column('user_id').text().notNullable();
      t.column('user').text();
      t.column('trace_id').text().notNullable();

      t.column('start_at').timestampnotz().notNullable().defaultTo(knex.fn.now());
      t.column('end_at').timestampnotz().defaultTo(null);
      t.column('created_at').timestampnotz().notNullable().defaultTo(knex.fn.now());
    })
    .createTable('orders', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('order_request_id').integer().references('order_requests');

      t.column('draft').boolean().notNullable().defaultTo(false);
      t.column('is_roll_off').boolean().notNullable().defaultTo(false);

      t.column('status')
        .text()
        .in(...ORDER_STATUSES)
        .notNullable();

      t.column('service_area_id').integer().references('service_areas_historical');
      t.column('custom_rates_group_id').integer().references({
        table: 'custom_rates_groups_historical',
        onDelete: 'restrict',
      });
      t.column('job_site_id').integer().notNullable().references('job_sites_historical');
      t.column('job_site_2_id').integer().references('job_sites_historical');
      t.column('customer_id').integer().notNullable().references('customers_historical');
      t.column('customer_job_site_id')
        .integer()
        .notNullable()
        .references('customer_job_site_historical');
      t.column('project_id').integer().references('projects_historical');
      t.column('billable_service_id').integer().references('billable_services_historical');
      t.column('material_id').integer().references('materials_historical');
      t.column('equipment_item_id').integer().references('equipment_items_historical');
      t.column('third_party_hauler_id').integer().references('3rd_party_haulers_historical');
      t.column('promo_id').integer().references('promos_historical');
      t.column('material_profile_id').integer().references('material_profiles_historical');
      t.column('global_rates_services_id').integer().references('global_rates_services_historical');
      t.column('custom_rates_group_services_id')
        .integer()
        .references('custom_rates_group_services_historical');
      t.column('billable_service_price').numeric();
      t.column('billable_service_total').numeric();
      // line_items are stored in separate table as one-to-many
      t.column('billable_line_items_total').numeric();
      t.column('thresholds_total').numeric();
      t.column('before_taxes_total').numeric();
      t.column('on_account_total').numeric().notNullable().defaultTo(0);
      t.column('initial_grand_total').numeric().notNullable();
      t.column('grand_total').numeric().notNullable();
      t.column('service_date').date().notNullable();
      t.column('job_site_contact_id').integer().references('contacts_historical');
      t.column('job_site_note').text();
      t.column('call_on_way_phone_number').text();
      t.column('text_on_way_phone_number').text();
      t.column('call_on_way_phone_number_id').integer();
      t.column('text_on_way_phone_number_id').integer();
      t.column('driver_instructions').text();
      t.column('permit_id').integer().references('permits_historical');
      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('someone_on_site').boolean().notNullable().defaultTo(false);
      t.column('to_roll').boolean().notNullable().defaultTo(false);
      t.column('high_priority').boolean().notNullable().defaultTo(false);
      t.column('early_pick').boolean().notNullable().defaultTo(false);
      t.column('alley_placement').boolean().defaultTo(false);
      t.column('cab_over').boolean().defaultTo(false);

      t.column('order_contact_id').integer().references('contacts_historical');
      t.column('disposal_site_id').integer().references('disposal_sites_historical');
      t.column('work_order_id').integer().references('work_orders');
      t.column('invoice_notes').text();
      t.column('cancellation_reason_type')
        .text()
        .in(...REASON_TYPES);
      t.column('cancellation_comment').text();
      t.column('unapproved_comment').text();
      t.column('unfinalized_comment').text();
      t.column('reschedule_comment').text();
      t.column('dropped_equipment_item').text();
      t.column('csr_email').text().notNullable();
      t.column('payment_method')
        .text()
        .in(...PAYMENT_METHODS)
        .defaultTo(PAYMENT_METHOD.onAccount);
      // .notNullable();
      t.column('invoice_date').timestampnotz();

      t.column('notify_day_before')
        .text()
        .in(...NOTIFY_DAY_BEFORE_TYPES);
      t.column('override_credit_limit').boolean().notNullable().defaultTo(false);

      t.column('created_by').text().notNullable().defaultTo('system');

      // only for filtering purposes
      t.column('mixed_payment_methods').arrayOf('text');
      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);
      t.column('commercial_taxes_used').boolean().notNullable().defaultTo(true);

      t.column('purchase_order_id').integer().references('purchase_orders');
      t.column('independent_work_order_id')
        .integer()
        .references('independent_work_orders')
        .defaultTo(null);

      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_billable_service_price').bigint();
      t.column('refactored_override_service_price').boolean().notNullable().defaultTo(false);
      t.column('refactored_overridden_service_price').bigint();
      t.column('refactored_service_total').bigint();
      t.column('refactored_billable_line_items_total').bigint();
      t.column('refactored_thresholds_total').bigint();
      t.column('refactored_billable_service_total').bigint();
      t.column('refactored_before_taxes_total').bigint();
      t.column('refactored_on_account_total').bigint();
      t.column('refactored_initial_grand_total').bigint();
      t.column('refactored_grand_total').bigint();
      t.column('refactored_invoiced_at').timestampnotz();
      t.column('refactored_paid_at').timestampnotz();
      t.column('refactored_surcharges_total').bigint();

      t.column('billable_service_price_to_display')
        .numeric()
        .generated('round(refactored_billable_service_price::numeric / 1000000, 2)');
      t.column('billable_service_total_to_display')
        .numeric()
        .generated('round(refactored_billable_service_total::numeric / 1000000, 2)');
      t.column('billable_line_items_total_to_display')
        .numeric()
        .generated('round(refactored_billable_line_items_total::numeric / 1000000, 2)');
      t.column('thresholds_total_to_display')
        .numeric()
        .generated('round(refactored_thresholds_total::numeric / 1000000, 2)');
      t.column('surcharges_total_to_display')
        .numeric()
        .generated('round(refactored_surcharges_total::numeric / 1000000, 2)');
      t.column('before_taxes_total_to_display')
        .numeric()
        .generated('round(refactored_before_taxes_total::numeric / 1000000, 2)');
      t.column('on_account_total_to_display')
        .numeric()
        .generated('round(refactored_on_account_total::numeric / 1000000, 2)');
      t.column('initial_grand_total_to_display')
        .numeric()
        .generated('round(refactored_initial_grand_total::numeric / 1000000, 2)');
      t.column('grand_total_to_display')
        .numeric()
        .generated('round(refactored_grand_total::numeric / 1000000, 2)');

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('line_items', t => {
      t.column('id').integer().identity();

      t.column('order_id')
        .integer()
        .notNullable()
        .references({ table: 'orders', onDelete: 'cascade' });

      t.column('billable_line_item_id')
        .integer()
        .notNullable()
        .references('billable_line_items_historical');
      t.column('material_id').integer().references('materials_historical');

      t.column('global_rates_line_items_id')
        .integer()
        .references('global_rates_line_items_historical');
      t.column('custom_rates_group_line_items_id')
        .integer()
        .references('custom_rates_group_line_items_historical');

      t.column('price').numeric().notNullable().defaultTo(0);
      t.column('quantity').numeric().notNullable();
      t.column('manifest_number').text();
      t.column('landfill_operation').boolean().notNullable().defaultTo(false);

      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_price').bigint();
      t.column('refactored_override_price').boolean().notNullable().defaultTo(false);
      t.column('refactored_overridden_price').bigint();
      t.column('refactored_invoiced_at').timestampnotz();
      t.column('refactored_paid_at').timestampnotz();
      t.column('price_to_display')
        .numeric()
        .generated('round(refactored_price::numeric / 1000000, 2)');

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('threshold_items', t => {
      t.column('id').integer().identity();

      t.column('order_id')
        .integer()
        .notNullable()
        .references({ table: 'orders', onDelete: 'cascade' });

      t.column('threshold_id').integer().notNullable().references('thresholds_historical');
      t.column('global_rates_thresholds_id')
        .integer()
        .references('global_rates_thresholds_historical');
      t.column('custom_rates_group_thresholds_id')
        .integer()
        .references('custom_rates_group_thresholds_historical');

      t.column('price').numeric().notNullable().defaultTo(0);
      t.column('quantity').numeric().notNullable();

      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_price').bigint();
      t.column('refactored_invoiced_at').timestampnotz();
      t.column('refactored_paid_at').timestampnotz();
      t.column('price_to_display')
        .numeric()
        .generated('round(refactored_price::numeric / 1000000, 2)');

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('order_tax_district', t => {
      t.column('id').integer().identity();
      t.column('tax_district_id').integer().references('tax_districts_historical');
      t.column('order_id').integer().references('orders');

      t.timestamps();
    });

  await migrationBuilder
    .createTable('customer_tax_exemptions', t => {
      t.column('id').integer().identity();

      t.column('customer_id')
        .integer()
        .notNullable()
        .references({ table: 'customers', onDelete: 'cascade' });

      t.column('enabled').boolean().notNullable();
      t.column('auth_number').text();
      t.column('image_url').text();

      t.column('timestamp').timestamp();
      t.column('author').text();

      t.unique('customer_id');

      t.timestamps();
    })
    .createTable('customer_tax_exemptions_non_group', t => {
      t.column('id').integer().identity();

      t.column('customer_id')
        .integer()
        .notNullable()
        .references({ table: 'customers', onDelete: 'cascade' });
      t.column('tax_district_id').integer().notNullable().references('tax_districts').notNullable();

      t.column('enabled').boolean().notNullable();
      t.column('auth_number').text();
      t.column('image_url').text();

      t.column('timestamp').timestamp();
      t.column('author').text();

      t.unique(['customer_id', 'tax_district_id']);

      t.timestamps();
    })
    .createTable('customer_job_site_tax_exemptions', t => {
      t.column('id').integer().identity();

      t.column('customer_job_site_id').integer().notNullable().references('customer_job_site');

      t.column('enabled').boolean().notNullable();
      t.column('auth_number').text();
      t.column('image_url').text();

      t.column('timestamp').timestamp();
      t.column('author').text();

      t.unique('customer_job_site_id');

      t.timestamps();
    })
    .createTable('customer_job_site_tax_exemptions_non_group', t => {
      t.column('id').integer().identity();

      t.column('customer_job_site_id').integer().notNullable().references('customer_job_site');
      t.column('tax_district_id').integer().references('tax_districts').notNullable();

      t.column('enabled').boolean().notNullable();
      t.column('auth_number').text();
      t.column('image_url').text();

      t.column('timestamp').timestamp();
      t.column('author').text();

      t.unique(['tax_district_id', 'customer_job_site_id']);

      t.timestamps();
    });

  await migrationBuilder
    .createTable('subscriptions', t => {
      t.column('id').integer().identity();
      t.column('status').text().in(SUBSCRIPTION_STATUSES).notNullable();
      t.column('csr_email').text();

      t.column('last_billed_at').timestamp();
      t.column('next_billing_date').date();

      t.column('custom_rates_group_id').integer().references('custom_rates_groups_historical');

      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('customer_id').integer().notNullable().references('customers_historical');
      t.column('job_site_id').integer().notNullable().references('job_sites_historical');
      t.column('service_area_id').integer().references('service_areas_historical');
      t.column('customer_job_site_id').integer().references('customer_job_site_historical');

      // Customer/Job Site Pair Details
      t.column('job_site_note').text();
      t.column('job_site_contact_id').integer().references('contacts_historical');
      t.column('job_site_contact_text_only').boolean().notNullable().defaultTo(false);
      t.column('driver_instructions').text();
      t.column('permit_id').integer().references('permits_historical');
      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('early_pick').boolean().notNullable().defaultTo(false);
      t.column('to_roll').boolean().notNullable().defaultTo(false);
      t.column('high_priority').boolean().notNullable().defaultTo(false);
      t.column('someone_on_site').boolean().notNullable().defaultTo(false);

      // Subscription Details
      t.column('third_party_hauler_id').integer().references('3rd_party_haulers_historical');
      t.column('subscription_contact_id').integer().references('contacts_historical');
      t.column('start_date').date();
      t.column('end_date').date();

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);
      t.column('billing_type')
        .text()
        .in(...BILLING_TYPES_VALUES);
      t.column('anniversary_billing').boolean().defaultTo(false);
      // can be empty
      t.column('next_billing_period_from').date();
      t.column('next_billing_period_to').date();

      t.column('equipment_type')
        .text()
        .in([...EQUIPMENT_TYPES, 'multiple'])
        .defaultTo(EQUIPMENT_TYPE.unspecified);

      t.column('unlock_overrides').boolean().notNullable().defaultTo(false);
      t.column('payment_method')
        .text()
        .in(PAYMENT_METHODS)
        .defaultTo(PAYMENT_METHOD.onAccount)
        .notNullable();

      t.column('promo_id').integer().references('promos_historical');
      t.column('billable_services_total').numeric();
      t.column('billable_line_items_total').numeric();
      t.column('before_taxes_total').numeric();
      t.column('initial_grand_total').numeric();
      t.column('grand_total').numeric();
      t.column('billable_subscription_orders_total').numeric().defaultTo(0);
      t.column('current_subscription_price').numeric();

      t.column('reason').text();
      t.column('reason_description').text();
      t.column('hold_subscription_until').date();
      t.column('service_frequency').text();
      t.column('alley_placement').boolean().defaultTo(false);
      t.column('signature_required').boolean().defaultTo(false);

      t.column('rates_changed').boolean();
      t.column('min_billing_periods').integer();
      t.column('subscription_end_email_sent').boolean().defaultTo(false);
      t.column('subscription_resume_email_sent').boolean().defaultTo(false);
      t.column('override_credit_limit').boolean().defaultTo(false);
      t.column('invoiced_date').date();

      t.column('recurring_grand_total').numeric().notNullable().defaultTo(0);
      t.column('paid_total').numeric().notNullable().defaultTo(0);
      t.column('period_from').date();
      t.column('period_to').date();

      t.column('purchase_order_id').integer().references('purchase_orders');
      t.column('csr_comment').text();
      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('permit_required').boolean().notNullable().defaultTo(false);
      t.column('cab_over').boolean().defaultTo(false);

      t.column('on_hold_email_sent').boolean().notNullable().defaultTo(false);
      t.column('on_hold_notify_sales_rep').boolean().notNullable().defaultTo(false);
      t.column('on_hold_notify_main_contact').boolean().notNullable().defaultTo(false);

      t.column('competitor_id').integer().references('3rd_party_haulers');
      t.column('competitor_expiration_date').date();

      t.timestamps();

      t.index(['business_unit_id', 'status']);

      t.addHistoricalTable();
    })
    .createTable('subscription_service_item', t => {
      t.column('id').integer().identity();

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);
      t.column('effective_date').date();
      t.column('recalculate').boolean().notNullable().defaultTo(false);
      t.column('prorate_total').numeric();
      t.column('service_frequency_id').integer().references('frequencies');

      t.column('subscription_id')
        .integer()
        .notNullable()
        .references({ table: 'subscriptions', onDelete: 'cascade' });
      t.column('billable_service_id')
        .integer()
        .references({ table: 'billable_services_historical' });

      t.column('global_rates_recurring_services_id')
        .integer()
        .references('global_rates_recurring_services_historical');
      t.column('custom_rates_group_services_id')
        .integer()
        .references('custom_rates_group_services_historical');
      t.column('material_id').integer().references('materials_historical');

      t.column('quantity').numeric();
      t.column('price').numeric();

      t.column('next_price').numeric();
      t.column('end_date').date();
      t.column('is_deleted').boolean().defaultTo(false);

      t.column('service_days_of_week').jsonb();

      t.column('proration_effective_date').date();
      t.column('proration_effective_price').numeric();
      t.column('invoiced_date').date();
      t.column('unlock_overrides').boolean().notNullable().defaultTo(false);
      t.column('proration_override').boolean().defaultTo(false);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('subscription_line_item', t => {
      t.column('id').integer().identity();

      t.column('effective_date').date();

      t.column('subscription_service_item_id')
        .integer()
        .notNullable()
        .references({ table: 'subscription_service_item', onDelete: 'cascade' });
      t.column('billable_line_item_id').integer().references('billable_line_items_historical');

      t.column('global_rates_recurring_line_items_billing_cycle_id')
        .integer()
        .references('global_rates_recurring_line_items_billing_cycle_historical');
      t.column('custom_rates_group_recurring_line_item_billing_cycle_id')
        .integer()
        .references('custom_rates_group_recurring_line_item_billing_cycle_historical');

      t.column('price').numeric();
      t.column('quantity').numeric();

      t.column('next_price').numeric();
      t.column('end_date').date();
      t.column('is_deleted').boolean().defaultTo(false);
      t.column('unlock_overrides').boolean().notNullable().defaultTo(false);
      t.column('proration_override').boolean().defaultTo(false);

      t.column('proration_effective_date').date();
      t.column('proration_effective_price').numeric();
      t.column('invoiced_date').date();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('subscription_orders', t => {
      t.column('id').integer().identity();

      t.column('billed_at').timestamp();
      t.column('included').boolean().notNullable().defaultTo(false);
      t.column('add_trip_charge').boolean().notNullable().defaultTo(false);
      t.column('cancellation_reason').text();

      t.column('job_site_contact_id').integer().references('contacts_historical');
      t.column('permit_id').integer().references('permits_historical');
      t.column('promo_id').integer().references('promos_historical');
      t.column('third_party_hauler_id').integer().references('3rd_party_haulers_historical');
      t.column('early_pick').boolean();
      t.column('unlock_overrides').boolean();

      t.column('work_orders_count').integer().notNullable().defaultTo(0);

      t.column('status')
        .text()
        .in(...SUBSCRIPTION_ORDER_STATUSES)
        .defaultTo(SUBSCRIPTION_ORDER_STATUS.scheduled);

      t.column('call_on_way_phone_number').text();
      t.column('text_on_way_phone_number').text();
      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('to_roll').boolean().notNullable().defaultTo(false);
      t.column('subscription_contact_id').integer().references('contacts_historical');
      t.column('signature_required').boolean().notNullable().defaultTo(false);

      t.column('can_reschedule').boolean().notNullable().defaultTo(false);
      t.column('one_time').boolean().notNullable().defaultTo(false);
      t.column('instructions_for_driver').text();
      t.column('job_site_note').text();
      t.column('job_site_contact_text_only').boolean().notNullable().defaultTo(false);
      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('someone_on_site').boolean();
      t.column('high_priority').boolean();
      t.column('has_comments').boolean().notNullable().defaultTo(false);
      t.column('has_assigned_routes').boolean().notNullable().defaultTo(false);
      t.column('started_at').timestamp();
      t.column('canceled_at').timestamp();
      t.column('completed_at').timestamp();
      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('permit_required').boolean().notNullable().defaultTo(false);

      t.column('subscription_service_item_id')
        .integer()
        .notNullable()
        .references({ table: 'subscription_service_item', onDelete: 'cascade' });
      t.column('billable_service_id')
        .integer()
        .references({ table: 'billable_services_historical' });
      t.column('material_id').integer().references('materials_historical');
      t.column('global_rates_services_id').integer().references('global_rates_services_historical');
      t.column('custom_rates_group_services_id')
        .integer()
        .references('custom_rates_group_services_historical');

      t.column('service_date').date().notNullable();
      t.column('price').numeric();
      t.column('quantity').numeric().notNullable();
      t.column('grandTotal').numeric();

      t.column('service_day_of_week_required_by_customer').boolean();
      t.column('assigned_route').text();
      t.column('billable_line_items_total').numeric();
      t.column('cancellation_comment').text();
      t.column('override_credit_limit').boolean().notNullable().defaultTo(false);
      t.column('invoiced_date').date();
      t.column('arrived_at').timestamp();
      t.column('deleted_at').timestamp();

      t.column('custom_rates_group_id').integer().references('custom_rates_groups_historical');
      t.column('destination_job_site_id').integer().references('job_sites_historical');

      t.column('subscription_id')
        .integer()
        .notNullable()
        .references({ table: 'subscriptions', onDelete: 'cascade' });
      t.column('sequence_id').text().notNullable();
      t.column('purchase_order_id').integer().references('purchase_orders');
      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);
      t.column('is_final_for_service').boolean().defaultTo(false);

      t.column('refactored_price').bigint();
      t.column('refactored_billable_line_items_total').bigint();
      t.column('refactored_surcharges_total').bigint();
      t.column('refactored_before_taxes_total').bigint();
      t.column('refactored_grand_total').bigint();
      t.column('refactored_invoiced_at').timestampnotz();
      t.column('refactored_paid_at').timestampnotz();
      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_price_group_historical_id')
        .integer()
        .references('price_groups_historical');

      t.timestamps();

      t.unique(['subscription_id', 'sequence_id'], {
        constraint: true,
        indexName: 'subscription_orders_sequence_id_unique',
      });

      t.addHistoricalTable();
    })

    .createTable('subscription_work_orders', t => {
      t.column('id').integer().identity();

      t.column('subscription_order_id').integer().notNullable().references('subscription_orders');
      t.column('status')
        .text()
        .in(...SUBSCRIPTION_WO_STATUSES)
        .defaultTo(SUBSCRIPTION_WO_STATUS.scheduled);

      t.column('cancellation_reason').text();

      t.column('new_equipment_number').text();

      t.column('job_site_note').text();
      t.column('job_site_contact_text_only').text();
      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('someone_on_site').boolean();
      t.column('high_priority').boolean();
      t.column('can_reschedule').boolean().notNullable().defaultTo(false);
      t.column('equipment_number').text();
      t.column('truck_number').text();
      t.column('departed_at').timestamp();
      t.column('arrived_at').timestamp();
      t.column('started_at').timestamp();
      t.column('canceled_at').timestamp();
      t.column('completed_at').timestamp();

      t.column('service_date').date();
      t.column('assigned_route').text();
      t.column('driver_name').text();
      t.column('instructions_for_driver').text();
      t.column('comment_from_driver').text();
      t.column('early_pick').boolean().notNullable().defaultTo(false);
      t.column('to_roll').boolean().notNullable().defaultTo(false);
      t.column('signature_required').boolean().notNullable().defaultTo(false);
      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('permit_required').boolean().notNullable().defaultTo(false);

      t.column('service_day_of_week_required_by_customer').boolean();
      t.column('billable_line_items_total').numeric();
      t.column('third_party_hauler_id').integer().references('3rd_party_haulers_historical');
      t.column('blocking_reason').text();
      t.column('weight').numeric();
      t.column('deleted_at').timestamp();
      t.column('dropped_equipment_item').text();
      t.column('picked_up_equipment_item').text();

      t.column('sequence_id').text().notNullable();
      t.column('purchase_order_id').integer().references('purchase_orders');

      t.timestamps();

      t.unique(['subscription_order_id', 'sequence_id'], {
        constraint: true,
        indexName: 'subscription_work_orders_sequence_id_unique',
      });

      t.addHistoricalTable();
    })
    .createTable('contractors', t => {
      t.column('id').integer().identity();

      t.column('customer_id').integer().notNullable().references('customers');
      t.column('contact_id').integer().notNullable();
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('email').text().notNullable().unique();

      t.column('image_url').text();
      t.column('mobile').text();
      t.column('toc_accepted').boolean().notNullable().defaultTo(false);

      t.timestamps();
    })
    .createTable('recurrent_order_templates', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('status')
        .text()
        .in(...RECURRENT_TEMPLATE_STATUSES)
        .notNullable();

      t.column('service_area_id').integer().references('service_areas_historical');
      t.column('job_site_id').integer().notNullable().references('job_sites_historical');
      t.column('customer_id').integer().notNullable().references('customers_historical');
      // always up-to-date since we need the most actual data from pair
      t.column('customer_job_site_id').integer().notNullable().references('customer_job_site');
      t.column('project_id').integer().references('projects_historical');
      t.column('third_party_hauler_id').integer().references('3rd_party_haulers_historical');
      t.column('promo_id').integer().references('promos_historical');
      t.column('material_profile_id').integer().references('material_profiles_historical');
      t.column('job_site_contact_id').integer().references('contacts_historical');
      t.column('order_contact_id').integer().references('contacts_historical');
      t.column('permit_id').integer().references('permits_historical');
      t.column('disposal_site_id').integer().references('disposal_sites_historical');

      // rates
      t.column('custom_rates_group_id').integer().references('custom_rates_groups_historical');
      t.column('global_rates_services_id')
        .integer()
        .notNullable()
        .references('global_rates_services_historical');
      t.column('custom_rates_group_services_id')
        .integer()
        .references('custom_rates_group_services_historical');

      // billable service configuration
      t.column('billable_service_id').integer().references('billable_services_historical');
      t.column('material_id').integer().references('materials_historical');
      t.column('equipment_item_id').integer().references('equipment_items_historical');
      t.column('billable_service_price').numeric().defaultTo(0);
      t.column('billable_service_quantity').integer().notNullable();
      t.column('billable_service_total').numeric().defaultTo(0);
      // line_items are stored in separate table as one-to-many
      t.column('billable_line_items_total').numeric().defaultTo(0);
      t.column('thresholds_total').numeric().defaultTo(0);

      // frequency configuration
      t.column('frequency_type')
        .text()
        .notNullable()
        .in(...RECURRENT_TEMPLATE_FREQUENCY_TYPES);
      t.column('frequency_period').integer();
      t.column('custom_frequency_type')
        .text()
        .in(...RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPES);
      t.column('frequency_days').arrayOf('integer');

      t.column('sync_date').date();
      t.column('next_service_date').date();

      t.check(`
                ((frequency_type = 'custom' and custom_frequency_type is not null
                and frequency_period is not null) or (frequency_type != 'custom'
                and custom_frequency_type is null and frequency_period is null))
            `);

      t.column('unlock_overrides').boolean().notNullable().defaultTo(false);
      t.column('before_taxes_total').numeric().notNullable().defaultTo(0);
      t.column('grand_total').numeric().notNullable().defaultTo(0);

      t.column('start_date').date().notNullable();
      t.column('end_date').date();

      t.column('job_site_note').text();
      t.column('call_on_way_phone_number').text();
      t.column('text_on_way_phone_number').text();
      t.column('call_on_way_phone_number_id').integer();
      t.column('text_on_way_phone_number_id').integer();
      t.column('driver_instructions').text();
      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('someone_on_site').boolean().notNullable().defaultTo(false);
      t.column('to_roll').boolean().notNullable().defaultTo(false);
      t.column('high_priority').boolean().notNullable().defaultTo(false);
      t.column('early_pick').boolean().notNullable().defaultTo(false);
      t.column('invoice_notes').text();
      t.column('csr_email').text().notNullable();
      t.column('alley_placement').boolean().defaultTo(false);
      t.column('cab_over').boolean().defaultTo(false);
      t.column('signature_required').boolean().defaultTo(false);

      t.column('payment_method')
        .text()
        .in(...PAYMENT_METHODS)
        .defaultTo(PAYMENT_METHOD.onAccount)
        .notNullable();
      t.column('notify_day_before')
        .text()
        .in(...NOTIFY_DAY_BEFORE_TYPES);

      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);
      t.column('billable_service_apply_surcharges').boolean().notNullable().defaultTo(true);
      t.column('surcharges_total').numeric();
      t.column('commercial_taxes_used').boolean().notNullable().defaultTo(true);
      t.column('purchase_order_id').integer().references('purchase_orders');

      t.column('on_hold_email_sent').boolean().notNullable().defaultTo(false);
      t.column('on_hold_notify_sales_rep').boolean().notNullable().defaultTo(false);
      t.column('on_hold_notify_main_contact').boolean().notNullable().defaultTo(false);

      t.column('refactored_price_group_id').integer().references('price_groups_historical');
      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_billable_service_price').bigint();
      t.column('refactored_billable_service_total').bigint();
      t.column('refactored_billable_line_items_total').bigint();
      t.column('refactored_thresholds_total').bigint();
      t.column('refactored_before_taxes_total').bigint();
      t.column('refactored_grand_total').bigint();
      t.column('refactored_surcharges_total').bigint();

      t.column('last_failure_date').date();
      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('recurrent_order_template_line_items', t => {
      t.column('id').integer().identity();

      t.column('recurrent_order_template_id')
        .integer()
        .notNullable()
        .references({ table: 'recurrent_order_templates', onDelete: 'cascade' });

      t.column('billable_line_item_id')
        .integer()
        .notNullable()
        .references('billable_line_items_historical');
      t.column('material_id').integer().references('materials_historical');

      t.column('global_rates_line_items_id')
        .integer()
        .references('global_rates_line_items_historical')
        .notNullable();
      t.column('custom_rates_group_line_items_id')
        .integer()
        .references('custom_rates_group_line_items_historical');

      t.column('price').numeric().notNullable();
      t.column('quantity').numeric().notNullable();

      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);

      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_price').bigint();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('recurrent_order_template_order', t => {
      t.column('id').integer().identity();

      t.column('recurrent_order_template_id')
        .integer()
        .notNullable()
        .references('recurrent_order_templates');

      t.column('order_id')
        .integer()
        .notNullable()
        .references({ table: 'orders', onDelete: 'cascade' });

      t.timestamps();
    })
    .createTable('subscription_orders_line_items', t => {
      t.column('id').integer().identity();

      t.column('subscription_work_order_id')
        .integer()
        .references({ table: 'subscription_work_orders', onDelete: 'cascade' });
      t.column('billable_line_item_id')
        .integer()
        .notNullable()
        .references('billable_line_items_historical');
      t.column('global_rates_line_items_id')
        .integer()
        .references('global_rates_line_items_historical')
        .notNullable();
      t.column('custom_rates_group_line_items_id')
        .integer()
        .references('custom_rates_group_line_items_historical');

      t.column('price').numeric().notNullable();
      t.column('quantity').numeric().notNullable();

      t.column('material_id').integer().references('materials_historical').defaultTo(null);
      t.column('work_order_line_item_id').integer();
      t.column('unlock_overrides').boolean().notNullable().defaultTo(false);

      t.column('refactored_price').bigint();
      t.column('refactored_invoiced_at').timestampnotz();
      t.column('refactored_paid_at').timestampnotz();
      t.column('refactored_price_id').integer().references('prices');

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('subscription_work_orders_line_items', t => {
      t.column('id').integer().identity();

      t.column('subscription_work_order_id').integer().references('subscription_work_orders');
      t.column('billable_line_item_id')
        .integer()
        .notNullable()
        .references('billable_line_items_historical');
      t.column('global_rates_line_items_id')
        .integer()
        .references('global_rates_line_items_historical')
        .notNullable();
      t.column('custom_rates_group_line_items_id')
        .integer()
        .references('custom_rates_group_line_items_historical');

      t.column('price').numeric().notNullable();
      t.column('quantity').numeric().notNullable();

      t.column('material_id').integer().references('materials_historical').defaultTo(null);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('notifications', t => {
      t.column('id').integer().identity();

      t.column('contractor_id').integer().notNullable(); // .references('contractors');
      t.column('order_request_id').integer(); // .references('order)_requests');

      t.column('type').text().notNullable();

      t.column('title')
        .text()
        .in(...NOTIFICATION_TITLES)
        .notNullable();

      t.column('time').timestamp().notNullable();
      t.column('body').text().notNullable();

      t.column('report_id').integer();
      t.column('report_url').text();
    })
    .createTable('subscription_work_orders_media', t => {
      t.column('id').integer().identity();

      t.column('subscription_work_order_id')
        .integer()
        .notNullable()
        .references({ table: 'subscription_work_orders', onDelete: 'cascade' });
      t.column('url').text().notNullable();
      t.column('timestamp').timestamp();
      t.column('author').text();
      t.column('file_name').text();

      t.unique(['subscription_work_order_id', 'url'], {
        constraint: true,
        indexName: 'subscription_work_orders_media_unique_constraint',
      });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('pre_invoiced_order_drafts', t => {
      t.column('id').integer().identity();

      t.column('generation_job_id').text().notNullable();

      t.column('order_status')
        .text()
        .in(...ORDER_STATUSES)
        .notNullable();

      t.column('order_id')
        .integer()
        .notNullable()
        .references({ table: 'orders', onDelete: 'cascade' });

      t.timestamps();
    })
    .createTable('subscriptions_media', t => {
      initMediaTable.call(t);

      t.column('subscription_id')
        .integer()
        .notNullable()
        .references({ table: 'subscriptions', onDelete: 'cascade' });

      t.unique(['subscription_id', 'url'], {
        constraint: true,
        indexName: 'subscriptions_media_unique_constraint',
      });
    })

    .createTable('customers_media', t => {
      initMediaTable.call(t);

      t.column('customer_id')
        .integer()
        .notNullable()
        .references({ table: 'customers', onDelete: 'cascade' });

      t.unique(['customer_id', 'url'], {
        constraint: true,
        indexName: 'customers_media_unique_constraint',
      });
    })
    .createTable('material_codes', t => {
      t.column('id').integer().identity();

      t.column('disposal_site_id').integer().notNullable().references('disposal_sites');
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('material_id').integer().references('materials');
      t.column('recycling_material_code').text();
      t.column('recycling_material_description').text();
      t.column('recycling_material_id').text();
      t.column('billable_line_item_id').integer().references('billable_line_items');

      t.unique(['disposal_site_id', 'business_line_id', 'material_id'], {
        constraint: true,
        indexName: 'material_codes_unique',
      });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('order_tax_district_taxes', t => {
      t.column('id').integer().identity();
      t.column('order_tax_district_id')
        .integer()
        .notNullable()
        .references({ table: 'order_tax_district', onDelete: 'cascade' });

      t.column('per_ton_rate').numeric();
      t.column('percentage_rate').numeric().defaultTo(0);
      t.column('amount').numeric().notNullable();
      t.column('flat_rate').boolean().notNullable().defaultTo(false);
      t.column('calculated_per_order').boolean().notNullable().defaultTo(false);

      t.column('type')
        .text()
        .notNullable()
        .in(...TAX_TYPES);

      t.column('line_item_id').integer().references('line_items');
      t.column('line_item_per_quantity_rate').numeric();
      t.column('threshold_id').integer().references('threshold_items');

      t.timestamps();
    })
    .createTable('landfill_operations', t => {
      t.column('id').integer().identity();

      t.column('order_id').integer().notNullable().references('orders');
      t.unique(['order_id']);

      t.column('ticket_number').text();
      t.column('ticket_url').text();
      t.column('ticket_date').timestamp();

      t.column('truck').text();
      t.column('time_in').timenotz();
      t.column('time_out').timenotz();
      t.column('net_weight').numeric();

      t.column('sync_date').timestamp();

      t.column('recycling_order_id').integer();

      t.column('mapped_material_id').integer();
      t.column('material_code').text();
      t.column('material_description').text();
      t.column('origin').text(); // description
      t.column('purchase_order').text();

      t.column('arrival_date').date();
      t.column('arrival_use_tare').boolean();
      t.column('departure_date').date();
      t.column('departure_use_tare').boolean();

      t.column('weight_in').numeric();
      t.column('weight_out').numeric();

      t.column('truck_tare').numeric();
      t.column('can_tare').numeric();

      t.column('materials').text();
      t.column('miscellaneous_items').text();

      t.column('media_files').arrayOf('text');

      t.column('weight_unit')
        .text()
        .in(...WEIGHT_UNITS);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('billable_surcharges', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('material_based_pricing').boolean().notNullable().defaultTo(false);

      t.column('description').text().notNullable();
      t.column('calculation')
        .text()
        .in(...SURCHARGE_CALCULATIONS);

      t.unique(['business_line_id', 'description']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('global_rates_surcharges', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('surcharge_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_surcharges', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'surcharge_id',
          "coalesce(material_id, '-1'::integer)",
        ],
        {
          constraint: false,
          indexName: 'global_rates_surcharges_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('custom_rates_group_surcharges', t => {
      t.column('id').integer().identity();
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('custom_rates_group_id')
        .integer()
        .notNullable()
        .references({ table: 'custom_rates_groups', onDelete: 'cascade' });

      t.column('surcharge_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_surcharges', onDelete: 'cascade' });
      t.column('material_id').integer().references({ table: 'materials', onDelete: 'cascade' });

      t.unique(
        [
          'business_unit_id',
          'business_line_id',
          'custom_rates_group_id',
          'surcharge_id',
          "coalesce(material_id, '-1'::integer)",
        ],
        {
          constraint: false,
          indexName: 'custom_rates_group_surcharge_unique_constraint',
        },
      );

      t.column('price').numeric().notNullable();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('business_unit_mail_settings', t => {
      t.column('id').integer().identity();

      t.column('admin_email').text();
      t.column('domain_id').integer().references('domains');
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
    .createTable('subscription_orders_media', t => {
      initMediaTable.call(t);

      t.column('subscription_order_id')
        .integer()
        .notNullable()
        .references({ table: 'subscription_orders', onDelete: 'cascade' });

      t.unique(['subscription_order_id', 'url'], {
        constraint: true,
        indexName: 'subscription_orders_media_unique_constraint',
      });
    })
    .createTable('independent_work_orders_media', t => {
      initMediaTable.call(t);

      t.column('independent_work_order_id')
        .integer()
        .notNullable()
        .references({ table: 'independent_work_orders', onDelete: 'cascade' });
      t.column('timestamp').timestamp();

      t.unique(['independent_work_order_id', 'url'], {
        constraint: true,
        indexName: 'independent_work_orders_media_unique_constraint',
      });
    })
    .createTable('manifest_items', t => {
      t.column('id').integer().identity();
      t.column('work_order_id').integer().notNullable().references('work_orders');
      t.column('material_id').integer().references('materials_historical');

      t.column('dispatch_id').integer();

      t.column('url').text().notNullable();
      t.column('quantity').numeric().notNullable();
      t.column('manifest_number').text().notNullable();

      t.column('unit_type')
        .text()
        .in(...WEIGHT_UNITS);
      t.column('csr_name').text();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('surcharge_item', t => {
      t.column('id').integer().identity();

      t.column('order_id')
        .integer()
        .notNullable()
        .references({ table: 'orders', onDelete: 'cascade' });

      t.column('surcharge_id').integer().notNullable().references('billable_surcharges_historical');
      t.column('billable_line_item_id').integer().references('billable_line_items_historical');
      t.column('billable_service_id').integer().references('billable_services_historical');
      t.column('threshold_id').integer().references('thresholds_historical');
      t.column('material_id').integer().references('materials_historical');

      t.column('global_rates_surcharges_id')
        .integer()
        .references('global_rates_surcharges_historical');
      t.column('custom_rates_group_surcharges_id')
        .integer()
        .references('custom_rates_group_surcharges_historical');

      t.column('amount').numeric();
      t.column('quantity').numeric();

      t.column('refactored_price_id').integer().references('prices');
      t.column('refactored_amount').bigint();
      t.column('refactored_invoiced_at').timestampnotz();
      t.column('refactored_paid_at').timestampnotz();
      t.column('amount_to_display')
        .numeric()
        .generated('round(refactored_amount::numeric / 1000000, 2)');

      t.column('line_item_id').integer().references('line_items');
      t.column('threshold_item_id').integer().references('threshold_items');

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('reminders', t => {
      t.column('id').integer().identity();
      t.column('type').text();
      // .in(...REMINDER_TYPES);
      t.column('entity_id').integer().notNullable();
      t.column('customer_id').integer().notNullable().references('customers');
      t.column('inform_by_app').boolean().notNullable().defaultTo(false);
      t.column('inform_by_email').boolean().notNullable().defaultTo(false);
      t.column('inform_by_sms').boolean().notNullable().defaultTo(false);
      t.column('date').date();

      t.column('is_processed').boolean().notNullable().defaultTo(false);
      t.column('job_site_id').integer().references('job_sites');
      t.column('processing_trace_id').text();

      t.column('informed_by_app_trace_id').text();
      t.column('informed_by_email_trace_id').text();
      t.column('informed_by_sms_trace_id').text();

      t.timestamps();

      t.unique(['type', 'entity_id', 'date']);
    })
    .createTable('user_reminders', t => {
      t.column('id').integer().identity();
      t.column('reminder_id')
        .integer()
        .notNullable()
        .references({ table: 'reminders', onDelete: 'cascade' });
      t.column('user_id').text().notNullable();

      t.column('informed_by_app_at').timestamp();
      t.column('informed_by_email_at').timestamp();
      t.column('informed_by_sms_at').timestamp();
      t.column('job_site_id').integer().references('job_sites');
      t.column('active').boolean().notNullable().defaultTo(true);

      t.timestamps();

      t.unique(['reminder_id', 'user_id']);
    })
    .createTable('truck_types_business_lines', t => {
      t.column('id').integer().identity();

      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('truck_type_id').integer().notNullable().references('truck_types');

      t.unique(['business_line_id', 'truck_type_id']);

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('truck_types_materials', t => {
      t.column('id').integer().identity();

      t.column('material_id').integer().notNullable().references('materials');
      t.column('truck_type_id').integer().notNullable().references('truck_types');

      t.unique(['material_id', 'truck_type_id']);

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('truck_types_equipment_items', t => {
      t.column('id').integer().identity();

      t.column('equipment_item_id').integer().notNullable().references('equipment_items');
      t.column('truck_type_id').integer().notNullable().references('truck_types');

      t.unique(['equipment_item_id', 'truck_type_id']);

      t.timestamps();
      t.addHistoricalTable();
    })

    .createTable('trucks_business_units', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('truck_id').integer().notNullable().references('trucks');

      t.unique(['business_unit_id', 'truck_id']);

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('drivers_business_units', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('driver_id').integer().notNullable().references('drivers');

      t.unique(['business_unit_id', 'driver_id']);

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('inventory', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable();
      t.column('equipment_item_id')
        .integer()
        .notNullable()
        .references({ table: 'equipment_items', onDelete: 'cascade' });
      t.column('total_quantity').numeric().notNullable().defaultTo(0);
      t.column('on_job_site_quantity').numeric().notNullable().defaultTo(0);
      t.column('on_repair_quantity').numeric().notNullable().defaultTo(0);

      t.timestamps();

      t.unique(['business_unit_id', 'equipment_item_id']);

      t.addHistoricalTable();
    })
    .createTable('billable_line_item_material', t => {
      t.column('id').integer().identity();

      t.column('material_id')
        .integer()
        .notNullable()
        .references({ table: 'materials', onDelete: 'cascade' });

      t.column('billable_line_item_id')
        .integer()
        .notNullable()
        .references({ table: 'billable_line_items', onDelete: 'cascade' });

      t.timestamps();
    })
    .createTable('customer_job_site_pairs_purchase_orders', t => {
      t.column('id').integer().identity();

      t.column('purchase_order_id').integer().notNullable().references('purchase_orders');
      t.column('customer_job_site_pair_id').integer().notNullable().references('customer_job_site');
      t.timestamps();

      t.unique(['purchase_order_id', 'customer_job_site_pair_id'], {
        constraint: true,
        indexName: CUSTOMER_JOBSITE_PAIR_ID_PO_ID_UNIQUE,
      });
    })
    .createTable('subscription_history', t => {
      t.column('id').integer().identity();
      t.column('subscription_id')
        .integer()
        .notNullable()
        .references({ table: 'subscriptions', onDelete: 'cascade' });
      t.column('action')
        .text()
        .in(...SUBSCTIPTION_HISTORY_ACTIONS)
        .notNullable();
      t.column('attribute').text();
      t.column('entity').text();
      t.column('entity_action').text();
      t.column('made_by').text().notNullable();
      t.column('made_by_id').text();
      t.column('effective_date').date();
      t.column('description').jsonb().notNullable();

      t.timestamps();
    })
    .createTable('sales_rep_history', t => {
      t.column('id').integer().identity();
      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('user_id').text();
      t.column('value').numeric();
      t.timestamps();
    })
    .createTable('destinations', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();
      t.column('geojson').jsonb();

      t.addAddressFields();

      t.unique(['business_unit_id', 'description'], {
        constraint: true,
        indexName: 'destinations_business_unit_id_description_unique_constraint',
      });

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('origins', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().notNullable();

      t.unique(['business_unit_id', 'description'], {
        constraint: true,
        indexName: 'origins_business_unit_id_description_unique_constraint',
      });

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('origin_districts', t => {
      t.column('id').integer().identity();

      t.column('state').text().notNullable();
      t.column('county').text();
      t.column('city').text();

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('origin_districts_origins', t => {
      t.column('id').integer().identity();

      t.column('origin_district_id').integer().notNullable().references('origin_districts');
      t.column('origin_id').integer().notNullable().references('origins');

      t.unique(['origin_district_id', 'origin_id']);

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('subscription_surcharge_item', t => {
      t.column('id').integer().identity();

      t.column('subscription_id')
        .integer()
        .notNullable()
        .references({ table: 'subscriptions', onDelete: 'cascade' });
      t.column('subscription_service_item_id')
        .integer()
        .references({ table: 'subscription_service_item', onDelete: 'cascade' });
      t.column('subscription_recurring_line_item_id')
        .integer()
        .references({ table: 'subscription_line_item', onDelete: 'cascade' });
      t.column('subscription_order_line_item_id')
        .integer()
        .references({ table: 'subscription_orders_line_items', onDelete: 'cascade' });
      t.column('subscription_order_id').integer().references('subscription_orders');

      t.column('surcharge_id').integer().notNullable().references('billable_surcharges_historical');
      t.column('billable_line_item_id').integer().references('billable_line_items_historical');
      t.column('billable_service_id').integer().references('billable_services_historical');
      t.column('material_id').integer().references('materials_historical');

      t.column('global_rates_surcharges_id')
        .integer()
        .notNullable()
        .references('global_rates_surcharges_historical');
      t.column('custom_rates_group_surcharges_id')
        .integer()
        .references('custom_rates_group_surcharges_historical');

      t.column('amount').numeric();
      t.column('quantity').numeric();

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('business_unit_service_days', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable().references('business_units');
      t.column('day_of_week').integer().notNullable();
      t.column('start_time').type('time without time zone').defaultTo(null);
      t.column('end_time').type('time without time zone').defaultTo(null);
      t.column('active').boolean().notNullable().defaultTo(false);

      t.timestamps();
    })
    .createTable('disposal_site_rates', t => {
      t.column('id').integer().identity();

      t.column('disposal_site_id').integer().notNullable().references('disposal_sites');
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('material_id').integer().notNullable().references('materials');
      t.column('unit')
        .text()
        .in(...DISPOSAL_RATE_UNITS);
      t.column('rate').numeric().notNullable();
      t.unique(['disposal_site_id', 'business_line_id', 'material_id'], {
        constraint: false,
        indexName: 'disposal_rates_unique',
      });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('truck_driver_general_costs', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().references('business_units');
      t.column('date').date().notNullable();
      t.column('changed_by').text().notNullable();
      t.column('average_cost').numeric().notNullable();
      t.column('truck_average_cost').numeric().notNullable();
      t.column('driver_average_cost').numeric().notNullable();
      t.column('detailed_costs').boolean().notNullable().defaultTo(false);

      t.unique(["coalesce(business_unit_id, '-1'::integer)", 'date'], {
        constraint: false,
        indexName: 'truck_driver_general_costs_business_unit_id_date_unique',
      });

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('truck_types_costs', t => {
      t.column('id').integer().identity();
      t.column('general_cost_id').integer().notNullable().references('truck_driver_general_costs');
      t.column('truck_type_id').integer().notNullable().references('truck_types');
      t.column('truck_average_cost').numeric();
      t.column('fuel_cost').numeric();
      t.column('misc_average_cost').numeric();
      t.column('insurance_cost').numeric();
      t.column('maintenance_cost').numeric();
      t.column('depreciation_cost').numeric();

      t.unique(['general_cost_id', 'truck_type_id']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('truck_costs', t => {
      t.column('id').integer().identity();
      t.column('general_cost_id').integer().notNullable().references('truck_driver_general_costs');
      t.column('truck_id').integer().notNullable().references('trucks');
      t.column('truck_average_cost').numeric();
      t.column('fuel_cost').numeric();
      t.column('misc_average_cost').numeric();
      t.column('insurance_cost').numeric();
      t.column('maintenance_cost').numeric();
      t.column('depreciation_cost').numeric();

      t.unique(['general_cost_id', 'truck_id']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('3rd_party_hauler_costs', t => {
      t.column('id').integer().identity();

      t.column('third_party_hauler_id').integer().notNullable().references('3rd_party_haulers');
      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('material_id').integer().references('materials');
      t.column('billable_service_id').integer().references('billable_services');
      t.column('cost').numeric().notNullable();

      t.unique(
        [
          'third_party_hauler_id',
          'business_line_id',
          "coalesce(billable_service_id, '-1'::integer)",
          "coalesce(material_id, '-2'::integer)",
        ],
        {
          constraint: false,
          indexName: '3rd_party_hauler_costs_unique_idx',
        },
      );

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('driver_costs', t => {
      t.column('id').integer().identity();
      t.column('general_cost_id').integer().notNullable().references('truck_driver_general_costs');
      t.column('driver_id').integer().notNullable().references('drivers');
      t.column('driver_average_cost').numeric().notNullable();

      t.unique(['general_cost_id', 'driver_id']);

      t.timestamps();

      t.addHistoricalTable();
    })
    .createTable('chats', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().references('business_units');
      t.column('status')
        .text()
        .in(...CHATS_STATUSES)
        .notNullable()
        .defaultTo(CHAT_STATUS.pending);

      t.column('last_replier').text();
      t.column('user_ids').arrayOf('text');
      t.column('last_message').text().notNullable();

      t.column('contractor_id').integer().notNullable().references('contractors');
      t.column('read_by').arrayOf('text').notNullable().defaultTo('{}');
      t.column('last_msg_timestamp').timestamp().notNullable().defaultTo('now()');

      t.timestamps();
    })
    .createTable('chat_messages', t => {
      t.column('id').integer().identity();

      t.column('message').text().notNullable();
      t.column('author_name').text().notNullable();
      t.column('read').boolean().notNullable().defaultTo(false);

      t.column('user_id').text();
      t.column('contractor_id').integer().references('contractors');
      t.column('chat_id').integer().notNullable().references('chats');

      t.timestamps();
    })
    .createTable('subscription_service_items_schedule', t => {
      t.column('id').integer().identity();

      t.column('subscription_id').integer().references('subscriptions');
      t.column('subscription_service_item_id').integer().references('subscription_service_item');
      t.column('billable_service_id').integer().references('billable_services');
      t.column('material_id').integer().references('materials');
      t.column('price_id').integer().references('prices');

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);

      t.column('frequency_id').integer();
      t.column('service_days_of_week').jsonb();

      t.column('quantity').integer();
      t.column('override_price').boolean().defaultTo(false);
      t.column('override_proration').boolean().defaultTo(false);

      t.column('price').bigint().notNullable();
      t.column('overridden_price').bigint().notNullable();
      t.column('next_price').bigint();
      t.column('amount').bigint();
      t.column('prorated_amount').bigint();
      t.column('overridden_prorated_amount').bigint();
      t.column('total').bigint();

      t.column('start_at').timestampnotz().notNullable().defaultTo(knex.fn.now());
      t.column('end_at').timestampnotz();

      t.column('invoiced_at').timestampnotz();
      t.column('paid_at').timestampnotz();

      t.column('created_at').timestampnotz().defaultTo(knex.fn.now());
    })
    .createTable('subscription_recurring_line_items_schedule', t => {
      t.column('id').integer().identity();

      t.column('subscription_id').integer().references('subscriptions');
      t.column('subscription_recurring_line_item_id')
        .integer()
        .references('subscription_line_item');
      t.column('billable_line_item_id').integer().references('billable_line_items');
      t.column('price_id').integer().references('prices');

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);

      t.column('quantity').integer();
      t.column('override_price').boolean().defaultTo(false);
      t.column('override_proration').boolean().defaultTo(false);

      t.column('price').bigint().notNullable();
      t.column('overridden_price').bigint().notNullable();
      t.column('next_price').bigint();
      t.column('amount').bigint();
      t.column('prorated_amount').bigint();
      t.column('overridden_prorated_amount').bigint();
      t.column('total').bigint();

      t.column('start_at').timestampnotz().notNullable().defaultTo(knex.fn.now());
      t.column('end_at').timestampnotz();

      t.column('invoiced_at').timestampnotz();
      t.column('paid_at').timestampnotz();

      t.column('created_at').timestampnotz().defaultTo(knex.fn.now());
    })
    .createTable('subscriptions_periods', t => {
      t.column('id').integer().identity();

      t.column('subscription_id').integer().references('subscriptions');
      t.column('price_group_historical_id').integer().references('price_groups_historical');

      t.column('status')
        .text()
        .in(...SUBSCRIPTION_STATUSES);

      t.column('billing_cycle')
        .text()
        .in(...BILLABLE_ITEMS_BILLING_CYCLES);

      t.column('billing_type')
        .text()
        .in(...BILLING_TYPES);

      t.column('override_proration').boolean().defaultTo(false);

      t.column('recurring_services_amount').bigint();
      t.column('recurring_services_prorated_amount').bigint();
      t.column('recurring_services_overridden_prorated_amount').bigint();
      t.column('recurring_services_total').bigint();

      t.column('recurring_line_items_amount').bigint();
      t.column('recurring_line_items_overridden_amount').bigint();
      t.column('recurring_line_items_total').bigint();
      t.column('recurring_line_items_overridden_total').bigint();

      t.column('recurring_amount').bigint();
      t.column('recurring_overridden_amount').bigint();
      t.column('recurring_total').bigint();
      t.column('recurring_overridden_total').bigint();

      t.column('one_time_amount').bigint();
      t.column('one_time_overridden_amount').bigint();
      t.column('one_time_total').bigint();
      t.column('one_time_overridden_total').bigint();

      t.column('before_taxes_grand_total').bigint();
      t.column('before_taxes_overridden_grand_total').bigint();
      t.column('surcharges_total').bigint();
      t.column('grand_total').bigint();
      t.column('overridden_grand_total').bigint();

      t.column('next_grand_total').bigint();

      t.column('start_at').timestampnotz().notNullable().defaultTo(knex.fn.now());
      t.column('end_at').timestampnotz();

      t.column('invoiced_at').timestampnotz();
      t.column('paid_at').timestampnotz();

      t.column('created_at').timestampnotz().defaultTo(knex.fn.now());
    })
    .createTable('change_reasons', t => {
      t.column('id').integer().identity();

      t.column('active').boolean().notNullable().defaultTo(true);
      t.column('description').text().unique().notNullable();

      t.timestamps();
      t.addHistoricalTable();
    })
    .createTable('change_reasons_business_lines', t => {
      t.column('id').integer().identity();

      t.column('business_line_id').integer().notNullable().references('business_lines');
      t.column('change_reason_id').integer().notNullable().references('change_reasons');

      t.unique(['business_line_id', 'change_reason_id']);

      t.timestamps();
    });

  await migrationBuilder
    .alterTable('job_sites', t => {
      t.column('purchase_order_id').integer().references('purchase_orders');
    })
    .alterTable('job_sites_historical', t => {
      t.column('purchase_order_id').integer();
    })
    .alterTable('business_units', t => {
      t.column('merchant_id').integer().references('merchants');
      t.column('sp_customer_group_id').integer().references('customer_groups');
    });

  await Promise.all([
    migrationBuilder.knex('frequencies').withSchema(schema).insert(FREQUENCIES_SEED_DATA),
    migrationBuilder
      .knex('billing_cycles_frequencies')
      .withSchema(schema)
      .insert(BILLING_CYCLES_FREQUENCIES_SEED_DATA),
    knex.raw(
      `create index job_sites_full_address_idx on ??.job_sites
            using gin (full_address gin_trgm_ops)`,
      [schema],
    ),
    knex.raw(
      `create index customers_name_idx on ??.customers
            using gin (name gin_trgm_ops)`,
      [schema],
    ),
    knex.raw(
      `create index disposal_sites_description_idx on ??.disposal_sites
            using gin (description gin_trgm_ops)`,
      [schema],
    ),
    knex.raw(
      `create index projects_description_idx on ??.projects
            using gin (description gin_trgm_ops)`,
      [schema],
    ),
    knex.raw(
      `create index customers_full_mailing_address_idx on ??.customers
        using gin (full_mailing_address gin_trgm_ops)`,
      [schema],
    ),
    knex.raw(
      `create index customers_full_billing_address_idx on ??.customers
        using gin (full_billing_address gin_trgm_ops)`,
      [schema],
    ),
    knex.raw(
      `create index business_unit_id_status_draft_idx on ${schema}.orders
        using btree (business_unit_id, status) where not draft`,
    ),
    knex.raw(
      'create index "subscriptions_media_updated_at_id" on "subscriptions_media"("updated_at" desc)',
    ),
    knex.raw(
      'create index "customers_media_updated_at_id" on "customers_media"("updated_at" desc)',
    ),
    knex.raw(
      `
          create index "subscription_work_orders_media_updated_at_idx"
              on "subscription_work_orders_media"("updated_at" desc)
      `,
    ),
    knex.raw('create index "price_groups_start_at" ON "price_groups" ("start_at" desc)'),
    knex.raw('create index "price_groups_end_at" ON "price_groups" ("end_at" asc nulls last)'),
    knex.raw(
      `create index "orders_non_invoiced" on "orders" ("refactored_invoiced_at")
                where "refactored_invoiced_at" is null`,
    ),
    knex.raw(
      `create index "orders_non_paid" on "orders" ("refactored_paid_at")
                where "refactored_paid_at" is null`,
    ),
    knex.raw(
      `create index "line_items_non_invoiced" on "line_items" ("refactored_invoiced_at")
                where "refactored_invoiced_at" is null`,
    ),
    knex.raw(
      `create index "line_items_non_paid" on "line_items" ("refactored_paid_at")
                where "refactored_paid_at" is null`,
    ),
    knex.raw(
      `create index "threshold_items_non_invoiced"
                on "threshold_items" ("refactored_invoiced_at")
                where "refactored_invoiced_at" is null`,
    ),
    knex.raw(
      `create index "threshold_items_non_paid" on "threshold_items" ("refactored_paid_at")
                where "refactored_paid_at" is null`,
    ),
    knex.raw(
      `create index "surcharge_item_non_invoiced"
                on "surcharge_item" ("refactored_invoiced_at")
                where "refactored_invoiced_at" is null`,
    ),
    knex.raw(
      `create index "surcharge_item_non_paid" on "surcharge_item" ("refactored_paid_at")
                where "refactored_paid_at" is null`,
    ),
    knex.raw(
      `create unique index ?? on ??.price_groups (business_unit_id, business_line_id) where is_general = true`,
      [UNIQUE_BUID_LOBID_IS_GENERAL, schema],
    ),
  ]);

  await Promise.all([
    knex.raw(`
        create view order_miscellaneous_items as
        select misc.order_id, misc.description, sum(misc.quantity) as quantity, misc.material_id
        from (
            select
                l.order_id,
                l.quantity,
                case when m.recycle then m.description else 'zzz non recyclable' end as description,
                case when m.recycle then m.id else null end as material_id
            from (
                select l.order_id, m.* as items
                from landfill_operations l,
                    jsonb_to_recordset(l.miscellaneous_items::jsonb) m(code text, quantity numeric, mapped boolean)
                where m.mapped = true
            ) as l
            join orders o on o.id = l.order_id
            join disposal_sites_historical dh on dh.id = o.disposal_site_id
            join material_codes mc
                on mc.business_line_id = o.business_line_id
                    and mc.disposal_site_id = dh.original_id
                    and mc.recycling_material_code = l.code
            join materials m on m.id = mc.material_id
        ) misc
        group by misc.order_id, misc.description, misc.material_id;
    `),
    knex.raw(`
        create view order_material_distributions as
        select md.order_id, md.description, sum(md.value) as value, md.material_id
        from (
            select
                l.order_id,
                l.value,
                case when m.recycle then m.description else 'zzz non recyclable' end as description,
                case when m.recycle then m.id else null end as material_id
            from (
                select l.order_id, m.* as items
                from landfill_operations l,
                    jsonb_to_recordset(l.materials::jsonb) m(code text, value numeric, mapped boolean)
                where m.mapped = true
            ) as l
            join orders o on o.id = l.order_id
            join disposal_sites_historical dh on dh.id = o.disposal_site_id
            join material_codes mc
                on mc.business_line_id = o.business_line_id
                    and mc.disposal_site_id = dh.original_id
                    and mc.recycling_material_code = l.code
            join materials m on m.id = mc.material_id
        ) md
        group by md.order_id, md.description, md.material_id;
    `),
    knex.raw(`
      create view profitability_items as
        select o.id, case when tax_case.taxable then o.grand_total else o.before_taxes_total end as grand_total,
        tax_case.taxable as with_taxes, grand_total - before_taxes_total as taxes_total,
        o.service_date, o.work_order_id, o.business_unit_id, o.billable_service_total as service_total,
        coalesce(o.billable_line_items_total + o.thresholds_total, 0) as line_items_total,
        coalesce(w.weight, 0) as disposal_weight, w.weight_unit as disposal_weight_unit, coalesce(w.haul_hours, 0) as haul_hours,
        tdc.id as truck_driver_costs_id,
        coalesce((case
          when tdc.detailed_costs
            then coalesce(tc.fuel_cost + tc.misc_average_cost + tc.insurance_cost + tc.maintenance_cost + tc.depreciation_cost,
              ttc.fuel_cost + ttc.misc_average_cost + ttc.insurance_cost + ttc.maintenance_cost + ttc.depreciation_cost,
              tdc.truck_average_cost, 0)
            else coalesce(tc.truck_average_cost, ttc.truck_average_cost, tdc.truck_average_cost, 0)
          end * w.haul_hours), 0) as truck_costs,
        coalesce((coalesce(dc.driver_average_cost, tdc.driver_average_cost, 0) * w.haul_hours), 0) as driver_costs,
        dsr.id as disposal_site_rate_id, coalesce(dsr.rate, 0) as disposal_rate, dsr.unit as disposal_unit,
        case when dsr.unit = w.weight_unit then w.weight * dsr.rate else 0 end as disposal_total,
        sr.user_id as sales_id, coalesce(sr.value, 0) as sales_rate,
        m.id as material_id, m.description as material_description,
        b.id as billable_service_id, b.description as billable_service_description,
        e.id as equipment_items_id, e.description as equipment_item_description, e.short_description as equipment_item_short_description,
        tph.id as third_party_hauler_id, tph.description as third_party_hauler_description,
        coalesce(tphcm.id, tphc.id) as third_party_hauler_costs_id, coalesce(tphcm.cost, tphc.cost, 0) as third_party_hauler_costs,
        js.id as job_site_id, js.address_line_1 as job_site_address_line_1,
        ds.id as disposal_site_id, ds.description as disposal_site_description,
        sa.id as service_area_id, sa.description as service_area_description,
        c.id as customer_id, c.name as customer_name, cg.id as customer_group_id, cg.description as customer_group_description,
        d.id as driver_id, d.description as driver_description,
        t.id as truck_id, t.description as truck_description, tt.id as truck_type_id, tt.description as truck_type_description,
        coalesce(surcharges_total.service_sum, 0) as service_surcharges, coalesce(surcharges_total.items_sum, 0) as line_items_surcharges
      from orders o
        inner join job_sites_historical jsh on jsh.id = job_site_id
        inner join job_sites js on js.id = jsh.original_id
        inner join customers_historical ch on ch.id = o.customer_id
        inner join customers c on c.id = ch.original_id
        inner join customer_groups cg on cg.id = c.customer_group_id
        left join (
          select *, coalesce(round((extract(epoch from
            (ww.finish_work_order_date - ww.start_work_order_date))/60/60)::numeric, 2), 0) as haul_hours
          from work_orders ww
        ) w on w.id = o.work_order_id
        left join materials_historical mh on mh.id = o.material_id
        left join materials m on m.id = mh.original_id
        left join billable_services_historical bh on bh.id = o.billable_service_id
        left join billable_services b on b.id = bh.original_id
        left join equipment_items_historical eh on eh.id = o.equipment_item_id
        left join equipment_items e on e.id = eh.original_id
        left join "3rd_party_haulers_historical" tphh on tphh.id = o.third_party_hauler_id
        left join "3rd_party_haulers" tph on tph.id = tphh.original_id
        left join drivers d on d.id = w.driver_id
        left join trucks t on t.id = w.truck_id
        left join truck_types tt on tt.id = t.truck_type_id
        left join disposal_sites_historical dsh on dsh.id = o.disposal_site_id
        left join disposal_sites ds on ds.id = dsh.original_id
        left join service_areas_historical sah on sah.id = o.service_area_id
        left join service_areas sa on sa.id = sah.original_id
        left join (
          select
            order_id,
            sum(case when billable_service_id is null then 0 else amount end) as service_sum,
            sum(case when billable_service_id is null then amount else 0 end) as items_sum
          from surcharge_item
          group by order_id
        )  surcharges_total on surcharges_total.order_id = o.id
        left join lateral (
          select sh.user_id, sh.value from sales_rep_history sh
          where sh.business_unit_id = o.business_unit_id and sh.user_id = c.sales_id and sh.created_at < o.created_at
          order by id desc
          limit 1
        ) sr on true
        left join lateral (
          select id, d.rate, d.unit || 's' as unit from disposal_site_rates_historical d
          where o.business_line_id = d.business_line_id and d.created_at < o.created_at and d.disposal_site_id = ds.id
            and m.id = d.material_id and d.event_type in ('created', 'edited')
          order by id desc
          limit 1
        ) dsr on true
        left join lateral (
          select id, tphc.cost from "3rd_party_hauler_costs_historical" tphc
          where o.business_line_id = tphc.business_line_id and tphc.created_at < o.created_at and tphc.third_party_hauler_id = tph.id
            and m.id = tphc.material_id and tphc.billable_service_id = b.id and tphc.event_type in ('created', 'edited')
          order by id desc
          limit 1
        ) tphcm on true
        left join lateral (
          select id, tphc.cost from "3rd_party_hauler_costs_historical" tphc
          where o.business_line_id = tphc.business_line_id and tphc.created_at < o.created_at and tphc.third_party_hauler_id = tph.id
            and tphc.material_id is null and tphc.billable_service_id = b.id and tphc.event_type in ('created', 'edited')
          order by id desc
          limit 1
        ) tphc on true
        left join lateral (
          select * from truck_driver_general_costs tdc
          where (tdc.business_unit_id = o.business_unit_id or tdc.business_unit_id is null)
            and to_char(tdc.date, 'YYYY-MM') = to_char(o.service_date, 'YYYY-MM')
          order by tdc.business_unit_id
          limit 1
        ) tdc on true
        left join truck_costs tc on tc.general_cost_id = tdc.id and tc.truck_id = t.id
        left join truck_types_costs ttc on ttc.general_cost_id = tdc.id and ttc.truck_type_id = tt.id
        left join driver_costs dc on dc.general_cost_id = tdc.id and dc.driver_id = d.id
        inner join (VALUES(true),(false)) as tax_case(taxable) on true
      where o.status not in ('inProgress') and not o.draft;
    `),
  ]);
};

export const down = (migrationBuilder, schema) => migrationBuilder.dropSchema(schema, true);
