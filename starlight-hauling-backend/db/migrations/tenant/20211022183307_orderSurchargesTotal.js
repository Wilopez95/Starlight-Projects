export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(['orders', 'orders_historical'], t => {
    t.column('surcharges_total').numeric();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(['orders', 'orders_historical'], t => {
    t.dropColumn('surcharges_total');
  });
};
