export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('weight_tickets', t => {
    t.column('recycling_business_unit_id').integer();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('weight_tickets', t => {
    t.dropColumn('recycling_business_unit_id');
  });
};
