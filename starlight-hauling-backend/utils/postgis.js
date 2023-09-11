export const toGeoJson = (knex, value) =>
  knex.raw('st_geomfromgeojson(?)', [JSON.stringify(value)]);

export const fromGeoToJsonAs = (knex, field = 'geometry') =>
  knex.raw('st_asgeojson(??)::jsonb as ??', [field, field]);

export const fromGeoToJson = (knex, field) => knex.raw('st_asgeojson(??)::jsonb', [field]);

export const covers = (knex, polygon, point, field = 'matched') =>
  knex.raw('st_covers(??,??) as ??', [polygon, point, field]);

export const intersects = (knex, polygon, polygonTwo) =>
  knex.raw('st_intersects(??,??)', [polygon, polygonTwo]);

export const toBbox = (knex, value) =>
  knex.raw('st_makebox2d(st_point(?, ?), st_point(?, ?))', value);

export const fromBbox = (knex, field) =>
  knex.raw(
    `
        (
            case
            when ?? is null then null
            else (array[st_xmin(??), st_ymin(??), st_xmax(??), st_ymax(??)])
            end
        ) as bbox
        `,
    [field, field, field, field, field],
  );
