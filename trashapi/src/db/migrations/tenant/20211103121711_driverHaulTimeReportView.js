import Reports from '../../../models/reports.js';
export const up = async knex => {
  const timezone = '__tz.name__';
  let query = Reports.getDailyCanaryQuery({
    timezone,
    byDateRange: {},
    byDateRangeUnion: {},
    byBU: true,
  });
  query = query.replace(/'__tz.name__'/g, 'tz.name');

  await knex.raw(`
    CREATE VIEW driver_haul_time_view AS
    SELECT r.*, 
      (r."stopTime" - r."startTime")::time as totalTime, 
      TO_CHAR((r."adjustedTime" || ' second')::interval, 'HH24:MI') as adjustedTimeStr,
      TO_CHAR(((r."adjustedTime" / r."woCount") || ' second')::interval, 'HH24:MI') as hph,
      (r."preTrip" - r."startTime")::time as perTripDiffTime 
    FROM ( 
      SELECT items.*, tz.name as "timeZone"
      FROM pg_timezone_names tz
      JOIN LATERAL (
        ${query}
      ) items ON true
    ) r;
  `);
};

export const down = async knex => {
  await knex.raw(`
    DROP VIEW IF EXISTS driver_haul_time_view;
  `);
};
