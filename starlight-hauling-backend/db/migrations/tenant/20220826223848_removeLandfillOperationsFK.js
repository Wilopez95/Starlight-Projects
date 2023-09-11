export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.landfill_operations
    DROP CONSTRAINT if exists landfill_operations_order_id_foreign;`,
    [schema],
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.raw('put migration core here [dont forget await]');
};
