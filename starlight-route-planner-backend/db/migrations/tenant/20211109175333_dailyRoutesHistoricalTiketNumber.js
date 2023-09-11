export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('daily_routes_historical', t => {
    t.column('ticket_number').text().alter();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('daily_routes_historical', t => {
    t.dropColumn('ticket_number');
    t.column('ticket_number').integer();
  });
};
