import { readTypeORMEnvConfig } from '../src/config';
import { createConnection } from 'typeorm';
import { keyBy, groupBy } from 'lodash';
import fs from 'fs';
import path from 'path';
// import PlatformAccount from '../src/modules/central/entities/PlatformAccount';
// import Role from '../src/modules/central/entities/Role';
// import ServicePermission from '../src/modules/central/entities/ServicePermission';
// import { PolicyEffect } from '../src/modules/central/entities/PolicyStatement';
// import RolePolicyStatement from '../src/modules/central/entities/RolePolicyStatement';
// import User from '../src/modules/central/entities/User';
// import Service from '../src/modules/central/entities/Service';

const main = async (): Promise<void> => {
  const typeorm = await readTypeORMEnvConfig();
  const oldSchema = 'srn:starlight:recycling:1';
  const newSchema = 'srn:starlight:recycling:4';
  // eslint-disable-next-line
  // @ts-ignore
  const oldConnection = await createConnection({
    ...typeorm,
    schema: oldSchema,
    name: 'old-schema',
  });
  // eslint-disable-next-line
  // @ts-ignore
  const newConnection = await createConnection({
    ...typeorm,
    schema: newSchema,
    migrationsRun: false,
    name: 'new-schema',
  });

  // const oldTablesInfo = await oldConnection.query(
  //   `SELECT * FROM "information_schema"."tables" WHERE ("table_schema" = '${oldSchema}' AND "table_name" = 'material') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_group') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'user') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_contact') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'tax_district') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'project') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'job_site') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_job_site') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'tax_exemption') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'container') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'origin') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_truck') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'destination') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'global_rack_rates') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'price_group') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'credit_card') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'order') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'billable_item') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'billable_item_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'comment') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'company') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'credit_card_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_group_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'customer_job_site_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'material_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'price_group_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'tax_district_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'job_site_tax_district') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'order_history') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'global_rack_rates_materials_material') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'global_rack_rates_billable_items_billable_item') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'credit_card_customer_job_sites_customer_job_site') OR ("table_schema" = '${oldSchema}' AND "table_name" = 'billable_item_material')`,
  // );
  // const newTablesInfo = await newConnection.query(
  //   `SELECT * FROM "information_schema"."tables" WHERE ("table_schema" = '${newSchema}' AND "table_name" = 'material') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_group') OR ("table_schema" = '${newSchema}' AND "table_name" = 'user') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_contact') OR ("table_schema" = '${newSchema}' AND "table_name" = 'tax_district') OR ("table_schema" = '${newSchema}' AND "table_name" = 'project') OR ("table_schema" = '${newSchema}' AND "table_name" = 'job_site') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_job_site') OR ("table_schema" = '${newSchema}' AND "table_name" = 'tax_exemption') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer') OR ("table_schema" = '${newSchema}' AND "table_name" = 'container') OR ("table_schema" = '${newSchema}' AND "table_name" = 'origin') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_truck') OR ("table_schema" = '${newSchema}' AND "table_name" = 'destination') OR ("table_schema" = '${newSchema}' AND "table_name" = 'global_rack_rates') OR ("table_schema" = '${newSchema}' AND "table_name" = 'price_group') OR ("table_schema" = '${newSchema}' AND "table_name" = 'credit_card') OR ("table_schema" = '${newSchema}' AND "table_name" = 'order') OR ("table_schema" = '${newSchema}' AND "table_name" = 'billable_item') OR ("table_schema" = '${newSchema}' AND "table_name" = 'billable_item_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'comment') OR ("table_schema" = '${newSchema}' AND "table_name" = 'company') OR ("table_schema" = '${newSchema}' AND "table_name" = 'credit_card_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_group_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'customer_job_site_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'material_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'price_group_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'tax_district_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'job_site_tax_district') OR ("table_schema" = '${newSchema}' AND "table_name" = 'order_history') OR ("table_schema" = '${newSchema}' AND "table_name" = 'global_rack_rates_materials_material') OR ("table_schema" = '${newSchema}' AND "table_name" = 'global_rack_rates_billable_items_billable_item') OR ("table_schema" = '${newSchema}' AND "table_name" = 'credit_card_customer_job_sites_customer_job_site') OR ("table_schema" = '${newSchema}' AND "table_name" = 'billable_item_material')`,
  // );
  const oldConstraintsInfo = await oldConnection.query(
    `SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "cnst"."conname" AS "constraint_name", pg_get_constraintdef("cnst"."oid") AS "expression", CASE "cnst"."contype" WHEN 'p' THEN 'PRIMARY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'x' THEN 'EXCLUDE' END AS "constraint_type", "a"."attname" AS "column_name" FROM "pg_constraint" "cnst" INNER JOIN "pg_class" "t" ON "t"."oid" = "cnst"."conrelid" INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "cnst"."connamespace" LEFT JOIN "pg_attribute" "a" ON "a"."attrelid" = "cnst"."conrelid" AND "a"."attnum" = ANY ("cnst"."conkey") WHERE "t"."relkind" IN ('r', 'p') AND (("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'material') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_group') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'user') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_contact') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'tax_district') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'project') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'job_site') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_job_site') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'tax_exemption') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'container') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'origin') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_truck') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'destination') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'global_rack_rates') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'price_group') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'credit_card') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'order') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'billable_item') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'billable_item_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'comment') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'company') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'credit_card_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_group_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_job_site_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'material_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'price_group_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'tax_district_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'job_site_tax_district') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'order_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'global_rack_rates_materials_material') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'global_rack_rates_billable_items_billable_item') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'credit_card_customer_job_sites_customer_job_site') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'billable_item_material'))`,
  );
  const newConstraintsInfo = await newConnection.query(
    `SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "cnst"."conname" AS "constraint_name", pg_get_constraintdef("cnst"."oid") AS "expression", CASE "cnst"."contype" WHEN 'p' THEN 'PRIMARY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'x' THEN 'EXCLUDE' END AS "constraint_type", "a"."attname" AS "column_name" FROM "pg_constraint" "cnst" INNER JOIN "pg_class" "t" ON "t"."oid" = "cnst"."conrelid" INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "cnst"."connamespace" LEFT JOIN "pg_attribute" "a" ON "a"."attrelid" = "cnst"."conrelid" AND "a"."attnum" = ANY ("cnst"."conkey") WHERE "t"."relkind" IN ('r', 'p') AND (("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'material') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_group') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'user') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_contact') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'tax_district') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'project') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'job_site') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_job_site') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'tax_exemption') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'container') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'origin') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_truck') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'destination') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'global_rack_rates') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'price_group') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'credit_card') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'order') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'billable_item') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'billable_item_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'comment') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'company') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'credit_card_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_group_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_job_site_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'material_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'price_group_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'tax_district_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'job_site_tax_district') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'order_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'global_rack_rates_materials_material') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'global_rack_rates_billable_items_billable_item') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'credit_card_customer_job_sites_customer_job_site') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'billable_item_material'))`,
  );
  const oldIndexesInfo = await oldConnection.query(
    `SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "i"."relname" AS "constraint_name", "a"."attname" AS "column_name", CASE "ix"."indisunique" WHEN 't' THEN 'TRUE' ELSE'FALSE' END AS "is_unique", pg_get_expr("ix"."indpred", "ix"."indrelid") AS "condition", "types"."typname" AS "type_name" FROM "pg_class" "t" INNER JOIN "pg_index" "ix" ON "ix"."indrelid" = "t"."oid" INNER JOIN "pg_attribute" "a" ON "a"."attrelid" = "t"."oid"  AND "a"."attnum" = ANY ("ix"."indkey") INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "t"."relnamespace" INNER JOIN "pg_class" "i" ON "i"."oid" = "ix"."indexrelid" INNER JOIN "pg_type" "types" ON "types"."oid" = "a"."atttypid" LEFT JOIN "pg_constraint" "cnst" ON "cnst"."conname" = "i"."relname" WHERE "t"."relkind" IN ('r', 'p') AND "cnst"."contype" IS NULL AND (("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'material') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_group') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'user') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_contact') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'tax_district') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'project') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'job_site') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_job_site') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'tax_exemption') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'container') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'origin') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_truck') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'destination') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'global_rack_rates') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'price_group') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'credit_card') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'order') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'billable_item') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'billable_item_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'comment') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'company') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'credit_card_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_group_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'customer_job_site_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'material_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'price_group_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'tax_district_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'job_site_tax_district') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'order_history') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'global_rack_rates_materials_material') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'global_rack_rates_billable_items_billable_item') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'credit_card_customer_job_sites_customer_job_site') OR ("ns"."nspname" = '${oldSchema}' AND "t"."relname" = 'billable_item_material'))`,
  );
  const newIndexesInfo = await newConnection.query(
    `SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "i"."relname" AS "constraint_name", "a"."attname" AS "column_name", CASE "ix"."indisunique" WHEN 't' THEN 'TRUE' ELSE'FALSE' END AS "is_unique", pg_get_expr("ix"."indpred", "ix"."indrelid") AS "condition", "types"."typname" AS "type_name" FROM "pg_class" "t" INNER JOIN "pg_index" "ix" ON "ix"."indrelid" = "t"."oid" INNER JOIN "pg_attribute" "a" ON "a"."attrelid" = "t"."oid"  AND "a"."attnum" = ANY ("ix"."indkey") INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "t"."relnamespace" INNER JOIN "pg_class" "i" ON "i"."oid" = "ix"."indexrelid" INNER JOIN "pg_type" "types" ON "types"."oid" = "a"."atttypid" LEFT JOIN "pg_constraint" "cnst" ON "cnst"."conname" = "i"."relname" WHERE "t"."relkind" IN ('r', 'p') AND "cnst"."contype" IS NULL AND (("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'material') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_group') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'user') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_contact') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'tax_district') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'project') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'job_site') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_job_site') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'tax_exemption') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'container') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'origin') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_truck') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'destination') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'global_rack_rates') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'price_group') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'credit_card') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'order') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'billable_item') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'billable_item_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'comment') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'company') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'credit_card_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_group_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'customer_job_site_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'material_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'price_group_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'tax_district_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'job_site_tax_district') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'order_history') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'global_rack_rates_materials_material') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'global_rack_rates_billable_items_billable_item') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'credit_card_customer_job_sites_customer_job_site') OR ("ns"."nspname" = '${newSchema}' AND "t"."relname" = 'billable_item_material'))`,
  );

  const oldConstraints = groupBy(oldConstraintsInfo, 'table_name'); // constraint_name, column_name
  const newConstraints = groupBy(newConstraintsInfo, 'table_name');
  const oldIndexes = groupBy(oldIndexesInfo, 'table_name'); // constraint_name, column_name
  const newIndexes = groupBy(newIndexesInfo, 'table_name');
  // const oldTables = keyBy(oldTablesInfo, 'table_name');
  // const newTables = keyBy(newTablesInfo, 'table_name');

  // eslint-disable-next-line
  // @ts-ignore
  const replaceList = [];
  // const replaceMap = {};

  Object.keys(newConstraints).forEach((tableName) => {
    const oldTableConstraintsMap = keyBy(
      oldConstraints[tableName],
      ({ column_name, constraint_type }) => {
        return `${column_name}:${constraint_type}`;
      },
    );
    const newTableConstraints = newConstraints[tableName];

    newTableConstraints.forEach(({ column_name, constraint_name, constraint_type }) => {
      const oldConstraintName =
        oldTableConstraintsMap[`${column_name}:${constraint_type}`]?.constraint_name;
      const oldConstraintType =
        oldTableConstraintsMap[`${column_name}:${constraint_type}`]?.constraint_type;

      if (!oldConstraintName) {
        return;
      }

      if (constraint_type !== oldConstraintType) {
        return;
      }

      replaceList.push({
        tableName,
        column_name,
        from: constraint_name,
        to: oldConstraintName,
      });
    });
  });

  Object.keys(newIndexes).forEach((tableName) => {
    const oldTableIndexesMap = keyBy(oldIndexes[tableName], 'column_name');
    const newTableIndexes = newIndexes[tableName];

    newTableIndexes.forEach(({ column_name, constraint_name }) => {
      const oldIndexName = oldTableIndexesMap[column_name].constraint_name;

      replaceList.push({
        tableName,
        column_name,
        from: constraint_name,
        to: oldIndexName,
      });
    });
  });

  // console.log('oldTables', oldTables, oldConstraints, oldIndexes);
  // console.log('newTables', newTables, newConstraints, newIndexes);

  const filepath = path.join(
    __dirname,
    '../src/modules/recycling/migrations/1614809394851-Initial.ts',
  );
  let migration = fs.readFileSync(filepath, 'utf8');

  // eslint-disable-next-line
  // @ts-ignore
  replaceList.forEach(({ from, to }) => {
    migration = migration.replace(new RegExp(from, 'g'), to);
  });

  fs.writeFileSync(filepath.replace('.ts', '-replaces.ts'), migration, 'utf8');

  // eslint-disable-next-line
  // @ts-ignore
  console.log('replaceList', replaceList);
};

main();
