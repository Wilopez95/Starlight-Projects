export const up = async migrationBuilder => {
  await migrationBuilder.raw(
    'create index orders_payments_payment_id_index on orders_payments (payment_id);',
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.raw('drop index orders_payments_payment_id_index;');
};
