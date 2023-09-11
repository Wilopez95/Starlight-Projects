export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(['work_orders', 'work_orders_historical'], t => {
    t.column('permit_required').boolean().defaultTo(false).notNullable();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(['work_orders', 'work_orders_historical'], t => {
    t.dropColumn('permit_required');
  });
};
