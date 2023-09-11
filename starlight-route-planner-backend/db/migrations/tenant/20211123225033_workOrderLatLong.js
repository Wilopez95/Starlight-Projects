export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('work_orders', t => {
    t.column('status_lon_change').numeric();
    t.column('status_lat_change').numeric();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('work_orders', t => {
    t.dropColumn('status_lon_change');
    t.dropColumn('status_lat_change');
  });
};
