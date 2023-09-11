export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['landfill_operations', 'landfill_operations_historical'],
    t => {
      t.column('arrival_date').timestamp().alter();
      t.column('departure_date').timestamp().alter();
    },
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['landfill_operations', 'landfill_operations_historical'],
    t => {
      t.column('arrival_date').date().alter();
      t.column('departure_date').date().alter();
    },
  );
};
