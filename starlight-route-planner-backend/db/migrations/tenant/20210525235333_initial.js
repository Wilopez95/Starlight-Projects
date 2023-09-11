import {
  CANCELLATION_REASONS,
  WO_STATUSES,
  WO_HISTORICAL_ENTITY_TYPES,
} from '../../../consts/workOrder.js';
import { WEIGHT_UNITS } from '../../../consts/weightUnits.js';
import { FREQUENCY_TYPES, FREQUENCIES_SEED_DATA } from '../../../consts/frequencyTypes.js';
import { COLORS_VALUES } from '../../../consts/colors.js';
import { MASTER_ROUTE_STATUSES, MASTER_ROUTE_STATUS_ENUM } from '../../../consts/masterRoute.js';
import {
  DAILY_ROUTE_STATUS,
  DAILY_ROUTE_STATUSES,
  DAILY_ROUTE_HISTORICAL_EVENT_TYPES,
  DAILY_ROUTE_HISTORICAL_ENTITY_TYPES,
} from '../../../consts/dailyRoute.js';
import { BUSINESS_LINE_ROUTE_TYPES } from '../../../consts/businessLineTypes.js';
import { EVENT_TYPES } from '../../../consts/comment.js';
import { UNIT_OF_MEASURE, UNITS_OF_MEASURE } from '../../../consts/unitsOfMeasure.js';

import { makeHaulingRequest } from '../../../utils/makeRequest.js';

export const up = async (migrationBuilder, schema) => {
  await migrationBuilder
    .createSchema(schema)
    .createExtension('public', 'postgis')
    .createExtension('public', 'pg_trgm')
    .createTable('job_sites', t => {
      t.column('id').integer().identity();
      t.addAddressFields();
      t.column('full_address').text().notNullable()
        .generated(`(address_line_1 || ' ' || coalesce(address_line_2 || ' ', '')
                || city || ' ' || state || ' ' || zip)`);
      t.column('location').pointGeography().notNullable();
      t.column('coordinates').arrayOf('numeric', 2);
      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('cab_over').boolean().notNullable().defaultTo(false);
      t.column('contact_id').integer();
      t.column('media').arrayOf('text');
      t.column('purchase_order').text();
      t.timestamps();
    })
    .raw(
      `create index job_sites_zip_trgm_idx on ??.job_sites
            using gin (zip gin_trgm_ops)`,
      [schema],
    )
    .raw(
      `create index job_sites_city_trgm_idx on ??.job_sites
            using gin (city gin_trgm_ops)`,
      [schema],
    )
    .raw(
      `create index job_sites_address_line_1_trgm_idx on ??.job_sites
            using gin (address_line_1 gin_trgm_ops)`,
      [schema],
    )
    .createTable('work_orders', t => {
      t.column('id').integer().identity();
      t.column('order_id').integer().notNullable();
      t.column('order_display_id').text().notNullable();
      t.column('assigned_route').text();
      t.column('preferred_route').text();
      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('status')
        .text()
        .in(...WO_STATUSES);
      t.column('service_date').date();
      t.column('business_line_id').integer().notNullable();
      t.column('business_unit_id').integer().notNullable();
      t.column('customer_id').integer().notNullable();
      t.column('equipment_item_id').integer().notNullable();
      t.column('equipment_item_size').numeric();
      t.column('job_site_id').integer();
      t.column('material_id').integer();
      t.column('service_area_id').integer().notNullable();
      t.column('service_item_id').integer();
      t.column('subscription_id').integer();
      t.column('billable_service_id').integer().notNullable();
      t.column('billable_service_description').text().notNullable();
      t.column('job_site_contact_id').integer();
      t.column('sequence').integer();
      t.column('completed_at').timestamp();
      t.column('instructions_for_driver').text();
      t.column('cancellation_reason')
        .text()
        .in(...CANCELLATION_REASONS);
      t.column('cancellation_comment').text();
      t.column('canceled_at').timestamp();
      t.column('picked_up_equipment').text();
      t.column('dropped_equipment').text();
      t.column('weight').numeric();
      t.column('weight_unit')
        .text()
        .in(...WEIGHT_UNITS);
      t.column('job_site_note').text();
      t.column('someone_on_site').boolean();
      t.column('high_priority').boolean();
      t.column('signature_required').boolean().notNullable().defaultTo(false);
      t.column('to_roll').boolean().notNullable().defaultTo(false);
      t.column('alley_placement').boolean().notNullable().defaultTo(false);
      t.column('po_required').boolean().notNullable().defaultTo(false);
      t.column('permit_required').boolean().notNullable().defaultTo(false);
      t.column('daily_route_id').integer();
      t.column('third_party_hauler_id').integer();
      t.column('third_party_hauler_description').text();
      t.column('phone_number').text();
      t.column('display_id').text().notNullable().unique();
      t.column('deleted_at').timestamp();

      t.column('is_independent').boolean().notNullable().defaultTo(false);
      t.column('work_order_id').integer().notNullable();

      t.unique(['work_order_id', 'is_independent'], {
        constraint: true,
        indexName: 'work_orders_dependency_constraint',
      });
      t.timestamps();
    })
    .raw(
      `create index work_orders_assigned_route_trgm_idx on ??.work_orders
            using gin (assigned_route gin_trgm_ops)`,
      [schema],
    )
    .createTable('frequencies', t => {
      t.column('id').integer().identity();

      t.column('times').integer();
      t.column('type')
        .text()
        .in(...FREQUENCY_TYPES)
        .notNullable();
    })
    .createTable('master_routes', t => {
      t.column('id').integer().identity();

      t.column('business_unit_id').integer().notNullable();

      t.column('status')
        .text()
        .in(...MASTER_ROUTE_STATUSES)
        .notNullable()
        .defaultTo(MASTER_ROUTE_STATUS_ENUM.ACTIVE);
      t.column('name').text().notNullable();

      t.column('publish_date').date();

      t.column('truck_id').text();
      t.column('driver_id').integer();

      t.column('service_days_list').arrayOf('integer');

      t.column('color')
        .text()
        .notNullable()
        .in(...COLORS_VALUES)
        .notNullable();

      t.column('published').boolean().notNullable().defaultTo(false);
      t.column('last_published_at').date();

      t.column('editing_by').text();
      t.column('editor_id').text();
      t.column('violation').arrayOf('text');

      t.column('business_line_type')
        .text()
        .in(...BUSINESS_LINE_ROUTE_TYPES);

      t.unique(['name', 'business_unit_id'], {
        indexName: 'master_routes_name_unique',
      });
      t.timestamps();
    })
    .createTable('service_items', t => {
      t.column('id').integer().identity();

      t.column('service_days_of_week').jsonb();
      t.column('hauling_id').integer().notNullable();
      t.column('customer_id').integer().notNullable();

      t.column('service_frequency_id').integer().notNullable().references('frequencies');

      t.column('business_line_id').integer().notNullable();
      t.column('business_unit_id').integer().notNullable();

      t.column('material_id').integer().notNullable();
      t.column('subscription_id').integer().notNullable();
      // period on front-end
      t.column('start_date').date().notNullable();
      t.column('end_date').date();

      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();

      t.column('billable_service_id').integer().notNullable();
      t.column('billable_service_description').text().notNullable();
      t.column('equipment_item_id').integer();
      t.column('service_area_id').integer().notNullable();
      t.column('job_site_id').integer().references('job_sites');

      t.timestamps();
    })
    .createTable('service_item_master_route', t => {
      t.column('id').integer().identity();

      t.column('service_item_id').integer().notNullable().references('service_items');
      t.column('master_route_id').integer().notNullable().references('master_routes');

      t.column('service_day').integer().notNullable();

      t.column('sequence').integer().notNullable();

      t.timestamps();
    })
    .createTable('daily_routes', t => {
      t.column('id').integer().identity();
      t.column('business_unit_id').integer().notNullable();
      t.column('name').text().notNullable();
      t.column('status')
        .text()
        .in(...DAILY_ROUTE_STATUSES)
        .defaultTo(DAILY_ROUTE_STATUS.scheduled);
      t.column('service_date').date();

      t.column('truck_id').text().notNullable();
      t.column('driver_id').integer().notNullable();
      t.column('driver_name').text();
      t.column('truck_type').text();
      t.column('completed_at').timestamp();

      t.column('parent_route_id').integer();
      t.column('color').text().notNullable();
      t.column('is_edited').boolean().defaultTo(false);

      t.column('clock_in').timestamp();
      t.column('clock_out').timestamp();
      t.column('odometer_start').numeric();
      t.column('odometer_end').numeric();
      t.column('unit_of_measure')
        .text()
        .notNullable()
        .in(...UNITS_OF_MEASURE)
        .defaultTo(UNIT_OF_MEASURE.mi);

      t.column('editing_by').text();
      t.column('editor_id').text();
      t.column('violation').arrayOf('text');
      t.column('truck_name').text();

      t.column('business_line_type')
        .text()
        .in(...BUSINESS_LINE_ROUTE_TYPES);

      t.unique(['name', 'business_unit_id'], {
        indexName: 'daily_routes_name_unique',
      });
      t.timestamps();
    })
    .raw(
      `create index daily_routes_name_trgm_idx on ??.daily_routes
          using gin (name gin_trgm_ops)`,
      [schema],
    )
    .raw(
      `create index daily_routes_truck_type_trgm_idx on ??.daily_routes
          using gin (truck_type gin_trgm_ops)`,
      [schema],
    )
    .raw(
      `create index daily_routes_driver_name_trgm_idx on ??.daily_routes
          using gin (driver_name gin_trgm_ops)`,
      [schema],
    )
    .createTable('comments', t => {
      t.column('id').integer().identity();

      t.column('work_order_id').integer().notNullable().references('work_orders');
      t.column('author_id').text();
      t.column('author_name').text();
      t.column('author_role').text();
      t.column('event_type')
        .text()
        .in(...EVENT_TYPES)
        .notNullable();
      t.column('comment').text();

      t.timestamps();
    })
    .createTable('work_orders_media', t => {
      t.column('id').uuid().primary();
      t.column('work_order_id')
        .integer()
        .notNullable()
        .references({ table: 'work_orders', onDelete: 'cascade' });
      t.column('url').text().notNullable();
      t.column('timestamp').timestamp();
      t.column('author').text();
      t.column('file_name').text();

      t.unique(['work_order_id', 'url'], {
        constraint: true,
        indexName: 'work_orders_media_unique_constraint',
      });

      t.timestamps();
    })
    .createTable('weight_tickets', t => {
      t.column('id').integer().identity();
      t.column('ticket_number').text().notNullable();
      t.column('daily_route_id')
        .integer()
        .notNullable()
        .references({ table: 'daily_routes', onDelete: 'cascade' });
      t.column('load_value').numeric().notNullable();
      t.column('weight_unit')
        .text()
        .in(...WEIGHT_UNITS)
        .notNullable();
      t.column('material_id').integer().notNullable();
      t.column('disposal_site_id').integer();
      t.column('arrival_time').text();
      t.column('departure_time').text();
      t.column('time_on_landfill').text();
      t.column('author_id').text();
      t.column('author_name').text();
      t.timestamps();
    })
    .createTable('weight_tickets_media', t => {
      t.column('id').uuid().primary();
      t.column('weight_ticket_id')
        .integer()
        .notNullable()
        .references({ table: 'weight_tickets', onDelete: 'cascade' });
      t.column('url').text().notNullable();
      t.column('timestamp').timestamp();
      t.column('author').text();
      t.column('file_name').text();

      t.unique(['weight_ticket_id']);

      t.timestamps();
    })
    .createTable('work_orders_historical', t => {
      t.column('id').integer().identity();
      t.column('original_id').integer().notNullable().references('work_orders');

      t.column('event_type').text();
      t.column('entity_type')
        .text()
        .in(...WO_HISTORICAL_ENTITY_TYPES);

      t.column('assigned_route').text();
      t.column('daily_route_id').integer();
      t.column('service_date').date();
      t.column('completed_at').timestamp();
      t.column('status').text();
      t.column('instructions_for_driver').text();
      t.column('picked_up_equipment').text();
      t.column('dropped_equipment').text();
      t.column('weight').numeric();
      t.column('deleted_at').timestamp();
      t.column('job_site_contact_id').integer();
      t.column('phone_number').text();

      t.column('best_time_to_come_from').text();
      t.column('best_time_to_come_to').text();
      t.column('alley_placement').boolean();
      t.column('someone_on_site').boolean();
      t.column('high_priority').boolean();
      t.column('signature_required').boolean();
      t.column('po_required').boolean();
      t.column('permit_required').boolean();
      t.column('to_roll').boolean();

      t.column('third_party_hauler_id').integer();
      t.column('third_party_hauler_description').text();
      t.column('status_lon_change').numeric();
      t.column('status_lat_change').numeric();
      t.column('truck_name').text();

      // daily routes
      t.column('truck_id').text();
      t.column('driver_id').integer();
      t.column('driver_name').text();
      t.column('truck_type').text();

      // media
      t.column('media_id').uuid();
      t.column('url').text();
      t.column('file_name').text();

      // comments
      t.column('comment_id').integer();
      t.column('comment_event_type').text();
      t.column('comment').text();

      t.column('user_id').text();
      t.column('user_name').text();

      t.timestamps();
    })
    .createTable('daily_routes_historical', t => {
      t.column('id').integer().identity();
      t.column('original_id')
        .integer()
        .notNullable()
        .references({ table: 'daily_routes', onDelete: 'cascade' });

      t.column('event_type')
        .text()
        .notNullable()
        .in(...DAILY_ROUTE_HISTORICAL_EVENT_TYPES);
      t.column('entity_type')
        .text()
        .in(...DAILY_ROUTE_HISTORICAL_ENTITY_TYPES);

      t.column('name').text();
      t.column('status').text();
      t.column('service_date').date();
      t.column('ticket_number').integer();

      t.column('truck_id').text();
      t.column('driver_id').integer();
      t.column('driver_name').text();
      t.column('truck_type').text();
      t.column('completed_at').timestamp();

      t.column('clock_in').timestamp();
      t.column('clock_out').timestamp();
      t.column('odometer_start').numeric();
      t.column('odometer_end').numeric();

      t.column('work_order_ids').arrayOf('integer');

      t.column('user_id').text();
      t.column('user_name').text();
      t.column('truck_name').text();

      t.timestamps();
    });

  await migrationBuilder.knex('frequencies').withSchema(schema).insert(FREQUENCIES_SEED_DATA);
  await makeHaulingRequest(
    {},
    {
      method: 'post',
      url: '/admin/sync/job-sites',
      data: {
        schemaName: schema,
      },
    },
  );

  await migrationBuilder.raw(
    `
        create view ??.daily_routes_view as
            select dr.id as id, count(wo.id) as wo_count, count(distinct wo.job_site_id) as job_site_count, coalesce(sum(wo.equipment_item_size), 0) as total_size
            from ??.daily_routes dr
                join ??.work_orders wo on wo.daily_route_id = dr.id
            group by dr.id;
    `,
    [schema, schema, schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.dropSchema(schema, true);
  await migrationBuilder.dropExtension('pg_trgm');
  await migrationBuilder.dropExtension('postgis');
};
