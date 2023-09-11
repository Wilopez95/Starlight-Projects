export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('settlement_transactions', t => {
    t.column('sp_used').boolean().defaultTo(false).notNullable();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('settlement_transactions', t => {
    t.dropColumn('sp_used');
  });
};
