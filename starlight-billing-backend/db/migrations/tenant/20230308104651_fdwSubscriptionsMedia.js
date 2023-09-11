export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`CREATE FOREIGN TABLE ${schema}.f_subscriptions_media (
      id uuid,
      url text,
      file_name text,
      author text,
      created_at timestamp,
      updated_at timestamp,
      subscription_id int4)
    SERVER fdw_pricing OPTIONS(table_name 'subscriptions_media')`);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`DROP FOREIGN TABLE ${schema}.f_subscriptions_media`);
};
