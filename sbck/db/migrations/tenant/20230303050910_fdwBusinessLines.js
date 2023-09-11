export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`CREATE FOREIGN TABLE ${schema}.f_business_lines (
    id int4,
    active bool,
    "name" text,
    description text,
    short_name text,
    "type" text,
    created_at timestamp,
    updated_at timestamp)
  SERVER fdw_core OPTIONS(table_name 'business_lines')`);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`DROP FOREIGN TABLE ${schema}.f_business_lines`);
};
