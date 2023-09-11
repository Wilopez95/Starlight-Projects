const getLatestBatch = async (knex, { migrationTable, tenantMigrationTable, internalSchema }) => {
  const result = await knex.raw(
    `select (
            case
                when max(a.batch) > max(b.batch)
                then
                    max(a.batch)
                else
                    max(b.batch)
            end
        ) as "maxBatch" from ??.?? as a, ??.?? as b`,
    [internalSchema, migrationTable, internalSchema, tenantMigrationTable],
  );

  return result.rows[0] ? result.rows[0].maxBatch : 0;
};

export default getLatestBatch;
