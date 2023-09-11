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
    DROP VIEW IF EXISTS driver_haul_time_view;
    CREATE OR REPLACE VIEW driver_haul_time_view AS
    SELECT r.id, r."reportDay", r.timecards, r.incomplete, r."startTime", r."stopTime", r."adjustedTime", r."preTrip", r.hauling_business_unit_id, r."woCount", r."timeZone" ,
      CASE WHEN comp.unit = 'metric' THEN r.miles * 1.609 ELSE r.miles END as miles,
      (r."stopTime" - r."startTime")::time as "totalTime", 
      TO_CHAR((r."adjustedTime" || ' second')::interval, 'HH24:MI') as "adjustedTimeStr",
      TO_CHAR(((r."adjustedTime" / r."woCount") || ' second')::interval, 'HH24:MI') as hph,
      (r."preTrip" - r."startTime")::time as "preTripDiffTime" 
    FROM ( 
      SELECT items.*, tz.name as "timeZone"
      FROM pg_timezone_names tz
      JOIN LATERAL (
        ${query}
      ) items ON true
    ) r
    left join tenanttable tt2 on 1=1
    left join admin.tenants ten on ten.name = tt2.tenant_name
    left join admin.companies comp on ten.id = comp.tenant_id
    ;
  `);
};

export const down = async knex => {
  await knex.raw(`
      DROP VIEW IF EXISTS driver_haul_time_view;
  `);
};
