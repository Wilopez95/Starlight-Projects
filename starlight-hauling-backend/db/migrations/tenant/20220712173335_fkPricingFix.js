export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.pre_invoiced_order_drafts
    DROP CONSTRAINT if exists pre_invoiced_order_drafts_order_id_foreign;`,
    [schema],
  );
};

// eslint-disable-next-line no-empty-function
export const down = async () => {};
