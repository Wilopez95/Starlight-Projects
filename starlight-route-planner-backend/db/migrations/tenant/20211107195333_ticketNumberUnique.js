export const up = async (migrationBuilder, schema) => {
  const weightTickets = await migrationBuilder
    .knex('weight_tickets')
    .withSchema(schema)
    .select(['id', 'ticket_number']);

  const { duplicatedWeightTicketIds } = weightTickets.reduce(
    (acc, curr) => {
      if (acc.iterated.includes(curr.ticket_number)) {
        acc.duplicatedWeightTicketIds.push(curr.id);
      }

      acc.iterated.push(curr.ticket_number);

      return acc;
    },
    { duplicatedWeightTicketIds: [], iterated: [] },
  );

  await Promise.all([
    migrationBuilder
      .knex('weight_tickets')
      .withSchema(schema)
      .whereIn('id', duplicatedWeightTicketIds)
      .del(),
    migrationBuilder
      .knex('weight_tickets_media')
      .withSchema(schema)
      .whereIn('weight_ticket_id', duplicatedWeightTicketIds)
      .del(),
  ]);

  await migrationBuilder.alterTable('weight_tickets', t => {
    t.unique(['ticket_number', 'daily_route_id'], {
      constraint: true,
      indexName: 'ticket_number_daily_route_id_unique_constraint',
    });
  });
};

export const down = migrationBuilder =>
  migrationBuilder.alterTable('weight_tickets', t => {
    t.dropConstraint('ticket_number_daily_route_id_unique_constraint');
  });
