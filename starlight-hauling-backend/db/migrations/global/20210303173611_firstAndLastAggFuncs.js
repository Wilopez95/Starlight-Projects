import config from '../../config.js';

export const up = async migrationBuilder => {
  await migrationBuilder.raw(`DROP AGGREGATE IF EXISTS ??.first(ANYELEMENT);`, [
    config.publicSchema,
  ]);
  await migrationBuilder.raw(
    `DROP FUNCTION IF EXISTS ??.first_agg(ANYELEMENT, ANYELEMENT) CASCADE;`,
    [config.publicSchema],
  );
  await migrationBuilder.raw(`DROP AGGREGATE IF EXISTS ??.last(ANYELEMENT);`, [
    config.publicSchema,
  ]);
  await migrationBuilder.raw(
    `DROP FUNCTION IF EXISTS ??.last_agg(ANYELEMENT, ANYELEMENT) CASCADE;`,
    [config.publicSchema],
  );
  await migrationBuilder.raw(
    `
        CREATE FUNCTION ??.first_agg(ANYELEMENT, ANYELEMENT)
          RETURNS ANYELEMENT
          LANGUAGE SQL IMMUTABLE STRICT
        AS
        $_$
        SELECT $1;
        $_$;
        `,
    [config.publicSchema],
  );
  await migrationBuilder.raw(
    `
        CREATE AGGREGATE ??.first( ANYELEMENT ) (
          SFUNC = first_agg,
          STYPE = ANYELEMENT
          );
        `,
    [config.publicSchema],
  );
  await migrationBuilder.raw(
    `
        CREATE FUNCTION ??.last_agg(ANYELEMENT, ANYELEMENT)
          RETURNS ANYELEMENT
          LANGUAGE SQL IMMUTABLE STRICT
        AS
        $_$
        SELECT $2;
        $_$;
        `,
    [config.publicSchema],
  );
  await migrationBuilder.raw(
    `
        CREATE AGGREGATE ??.last( ANYELEMENT ) (
          SFUNC = last_agg,
          STYPE = ANYELEMENT
          );
        `,
    [config.publicSchema],
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.raw(`DROP AGGREGATE IF EXISTS ??.first(ANYELEMENT);`, [
    config.publicSchema,
  ]);
  await migrationBuilder.raw(
    `DROP FUNCTION IF EXISTS ??.first_agg(ANYELEMENT, ANYELEMENT) CASCADE;`,
    [config.publicSchema],
  );
  await migrationBuilder.raw(`DROP AGGREGATE IF EXISTS ??.last(ANYELEMENT);`, [
    config.publicSchema,
  ]);
  await migrationBuilder.raw(
    `DROP FUNCTION IF EXISTS ??.last_agg(ANYELEMENT, ANYELEMENT) CASCADE;`,
    [config.publicSchema],
  );
};
