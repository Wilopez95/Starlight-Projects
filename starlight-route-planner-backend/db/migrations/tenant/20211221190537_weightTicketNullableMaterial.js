export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('weight_tickets', t => {
    t.dropNotNull('material_id');
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('weight_tickets', t => {
    t.column('material_id').integer().notNullable().alter();
  });
};
