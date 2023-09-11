export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('business_units', t => {
    t.column('coordinates').arrayOf('numeric', 2);
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('business_units', t => {
    t.dropColumn('coordinates');
  });
};
