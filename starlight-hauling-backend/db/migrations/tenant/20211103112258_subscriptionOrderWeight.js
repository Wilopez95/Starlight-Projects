const units = ['yards', 'tons'];

export const up = async migrationBuilder => {
  await migrationBuilder
    .alterTables(['subscription_orders', 'subscription_orders_historical'], t => {
      t.column('weight').numeric();
      t.column('finish_work_order_date').timestamp();
    })
    .alterTable('subscription_orders', t => {
      t.column('weight_unit')
        .text()
        .in(...units);
    })
    .alterTable('subscription_orders_historical', t => {
      t.column('weight_unit').text();
    });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['subscription_orders', 'subscription_orders_historical'],
    t => {
      t.dropColumn('weight');
      t.dropColumn('weight_unit');
      t.dropColumn('start_service_date');
      t.dropColumn('finish_work_order_date');
    },
  );
};
