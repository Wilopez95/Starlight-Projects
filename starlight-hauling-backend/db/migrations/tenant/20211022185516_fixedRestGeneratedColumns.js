export const up = async migrationBuilder => {
  await migrationBuilder
    .alterTable('orders_historical', t => {
      t.dropColumn('billable_service_price_to_display');
      t.dropColumn('billable_service_total_to_display');
      t.dropColumn('billable_line_items_total_to_display');
      t.dropColumn('thresholds_total_to_display');
      t.dropColumn('surcharges_total_to_display');
      t.dropColumn('before_taxes_total_to_display');
      t.dropColumn('on_account_total_to_display');
      t.dropColumn('initial_grand_total_to_display');
      t.dropColumn('grand_total_to_display');
    })
    .alterTable('line_items_historical', t => {
      t.dropColumn('price_to_display');
    })
    .alterTable('threshold_items_historical', t => {
      t.dropColumn('price_to_display');
    });

  await migrationBuilder
    .alterTable('orders_historical', t => {
      t.column('billable_service_price_to_display').numeric();
      t.column('billable_service_total_to_display').numeric();
      t.column('billable_line_items_total_to_display').numeric();
      t.column('thresholds_total_to_display').numeric();
      t.column('surcharges_total_to_display').numeric();
      t.column('before_taxes_total_to_display').numeric();
      t.column('on_account_total_to_display').numeric();
      t.column('initial_grand_total_to_display').numeric();
      t.column('grand_total_to_display').numeric();
    })
    .alterTable('line_items_historical', t => {
      t.column('price_to_display').numeric();
    })
    .alterTable('threshold_items_historical', t => {
      t.column('price_to_display').numeric();
    });
};

// eslint-disable-next-line no-empty-function
export const down = () => {};
