export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(['orders', 'orders_historical'], t => {
    t.column('csrName').text();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(['orders', 'orders_historical'], t => {
    t.dropColumn('csrName');
  });
};
