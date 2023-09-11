export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('customers', t => {
    t.column('hauler_srn').text();
    t.unique(['hauler_srn', 'business_unit_id'], {
      constraint: true,
      indexName: 'customers_hauler_srn_business_unit_id_unique_constraint',
    });
  });
  await migrationBuilder.alterTable('customers_historical', t => {
    t.column('hauler_srn').text();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('customers', t => {
    t.dropConstraint('customers_hauler_srn_business_unit_id_unique_constraint');
    t.dropColumn('hauler_srn');
  });
  await migrationBuilder.alterTable('customers_historical', t => {
    t.dropColumn('hauler_srn');
  });
};
