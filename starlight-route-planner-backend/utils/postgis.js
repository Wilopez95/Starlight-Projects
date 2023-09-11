export const toGeoJson = (knex, value) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    ['type', 'coordinates'].every(key => key in value)
  ) {
    return knex.raw('st_geomfromgeojson(?)', [JSON.stringify(value)]);
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
};
