export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['subscription_orders', 'subscription_orders_historical'],
    t => {
      t.column('dropped_equipment_item').text();
      t.column('picked_up_equipment_item').text();
    },
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['subscription_orders', 'subscription_orders_historical'],
    t => {
      t.dropColumn('dropped_equipment_item');
      t.dropColumn('picked_up_equipment_item');
    },
  );
};
