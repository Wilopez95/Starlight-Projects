export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.customers add column work_order_note text`,
    [schema],
  );

  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.customers_historical add column work_order_note text`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.customers drop column work_order_note;`,
    [schema],
  );

  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.customers_historical drop column work_order_note;`,
    [schema],
  );
};
