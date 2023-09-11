export const up = async migrationBuilder => {
  await migrationBuilder
    .alterTables(['threshold_items', 'line_items'], t => {
      t.column('apply_surcharges').boolean().notNullable().defaultTo(true);
    })
    .alterTables(['threshold_items_historical', 'line_items_historical'], t => {
      t.column('apply_surcharges').boolean();
    });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['threshold_items', 'line_items', 'threshold_items_historical', 'line_items_historical'],
    t => {
      t.dropColumn('surcharges_total');
    },
  );
};
