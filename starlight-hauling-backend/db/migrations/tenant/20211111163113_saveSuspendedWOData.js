export const up = async migrationBuilder => {
  await migrationBuilder.createTable('work_orders_suspended', t => {
    t.column('id').integer().identity();

    t.column('work_order_id').integer().notNullable().references('work_orders');
    t.column('driver_id').integer().notNullable().references('drivers');
    t.column('truck_id').integer().notNullable().references('trucks');
    t.column('haul_hours').numeric().notNullable();

    t.timestamps();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.dropTable('work_orders_suspended');
};
