// TODO: remove when the squash
export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('surcharge_item_historical', t => {
    t.dropColumn('amount_to_display');
  });

  await migrationBuilder.alterTable('surcharge_item_historical', t => {
    t.column('amount_to_display').numeric();
  });
};

// eslint-disable-next-line no-empty-function
export const down = () => {};
