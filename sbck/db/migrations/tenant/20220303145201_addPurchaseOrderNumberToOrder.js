export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('orders', t => {
    t.column('po_number').text();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('orders', t => {
    t.dropColumn('po_number');
  });
};
