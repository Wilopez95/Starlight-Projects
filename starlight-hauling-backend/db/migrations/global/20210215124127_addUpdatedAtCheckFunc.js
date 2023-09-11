import config from '../../config.js';

export const up = async migrationBuilder => {
  await migrationBuilder.raw(
    `
    CREATE OR REPLACE FUNCTION ??.updated_check(IN tableName regclass,
                                                       IN tId integer,
                                                       IN tUpdatedAt timestamp with time zone)
        RETURNS void AS $$
    DECLARE
        rec record;
    BEGIN
        EXECUTE 'SELECT updated_at FROM '
            || tableName
            || ' WHERE id = '
            || tId
        INTO rec;
        IF date_trunc('milliseconds', rec.updated_at) > date_trunc('milliseconds', tUpdatedAt)
        THEN
            RAISE EXCEPTION '__precondition__failed__412__';
        END IF;
    END;
    $$ LANGUAGE plpgsql;`,
    [config.internalSchema],
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.raw(
    `DROP FUNCTION IF EXISTS ??.updated_check(IN tableName regclass,
                                                       IN tId integer,
                                                       IN tUpdatedAt timestamp with time zone);`,
    [config.internalSchema],
  );
};
