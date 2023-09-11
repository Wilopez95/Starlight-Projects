export const up = async migrationBuilder => {
  await migrationBuilder
    .alterTable('subscription_orders_line_items', t => {
      t.column('subscription_order_id')
        .integer()
        .notNullable()
        .references({ table: 'subscription_orders', onDelete: 'cascade' });
    })
    .alterTable('subscription_orders_line_items_historical', t => {
      t.column('subscription_order_id').integer();
    });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['subscription_orders_line_items', 'subscription_orders_line_items_historical'],
    t => {
      t.dropColumn('subscription_order_id');
    },
  );
};
