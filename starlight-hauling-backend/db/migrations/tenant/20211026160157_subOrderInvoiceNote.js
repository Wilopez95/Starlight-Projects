export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['subscription_orders', 'subscription_orders_historical'],
    t => {
      t.column('invoice_notes').text();
      t.column('uncompleted_comment').text();
      t.column('unapproved_comment').text();
      t.column('unfinalized_comment').text();
    },
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['subscription_orders', 'subscription_orders_historical'],
    t => {
      t.dropColumn('invoice_notes');
      t.dropColumn('uncompleted_comment');
      t.dropColumn('unapproved_comment');
      t.dropColumn('unfinalized_comment');
    },
  );
};
