export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`CREATE FOREIGN TABLE ${schema}.f_job_sites (
      id int4,
      contact_id int4,
      media _text,
      address_line_1 text,
      address_line_2 text,
      city text,
      state text,
      zip text,
      full_address text,
      location public.geography(point, 4326),
      coordinates _numeric,
      alley_placement bool,
      cab_over bool,
      recycling_default bool,
      radius int4,
      polygon public.geography,
      created_at timestamp,
      updated_at timestamp,
      purchase_order_id int4,
      reference_number text,
      "name" text)
    SERVER fdw_core OPTIONS(table_name 'job_sites')`);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`DROP FOREIGN TABLE ${schema}.f_job_sites`);
};
