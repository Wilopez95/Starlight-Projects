import R from 'ramda';
import { endOfDay } from 'date-fns';
import { utcToZonedTime, format } from 'date-fns-tz';
import _debug from 'debug';
import { dateRange, getDbDateTemplate, getDbDateTimeTemplate } from '../utils/format.js';
import { buildQueryObj } from '../utils/query.js';
import { invalidInput } from '../utils/errors.js';

const debug = _debug('api:models:reports');

const reportHyphenDate = `'${getDbDateTemplate('-')}'`;
const reportSlashDate = `'${getDbDateTemplate('/')}'`;
const reportDateTime = `'${getDbDateTimeTemplate('/', ':')}'`;

const buSelect = (byBU, alias = 'w') => (byBU ? `${alias}.hauling_business_unit_id,` : '');
const buGroupBy = (byBU, alias = 'w') => (byBU ? `, ${alias}.hauling_business_unit_id` : '');

const validateTimezone = timezone => {
  if (!timezone) {
    throw invalidInput('Please, select a timezone');
  }
};

const getWhereClause = (conditions = []) => {
  if (!conditions?.length) {
    return '';
  }
  const filtered = conditions.filter(str => str?.length);
  if (!filtered?.length) {
    return '';
  }
  let query = 'WHERE';
  filtered.forEach((condition, index) => {
    const isLast = index === filtered.length - 1;
    query += isLast ? ` ${condition} ` : ` ${condition} AND `;
  });
  return query;
};

const getDriversTimecardsQuery = ({ byDateRange, timezone }) => `
  SELECT
    t.driver_id AS id,
    DATE(t.start_time AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}') AS "reportDay",
    COUNT(t.id) AS timecards,
    COUNT(CASE
      WHEN t.stop_time IS NULL THEN t.id
    END) AS incomplete,
    MIN(t.start_time) AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}' AS "startTime",
    (GREATEST(MAX(CASE
      WHEN t.stop_time IS NULL THEN t.start_time
      ELSE t.stop_time
    END), MAX(t.start_time)) AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}') AS "stopTime",
    SUM(extract(epoch from (CASE
      WHEN t.stop_time IS NULL THEN t.start_time
      ELSE t.stop_time
    END)) - extract(epoch from t.start_time)) AS "adjustedTime"
  FROM timecards t
  ${getWhereClause([byDateRange.timecardsQuery])}
  GROUP BY t.driver_id, "reportDay"
`;

const getDriversTripsQuery = ({ timezone, isDateRange = false, byDateRange }) => `
  SELECT
    t.driver_id AS id,
    DATE(t.created_date AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}') AS "reportDay",
    MIN(
      CASE WHEN t.trip_type = 'PRE_TRIP'
      THEN t.created_date AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}'
      ELSE NULL END
    ) AS "preTrip",
    MAX(t.odometer) - MIN(t.odometer) AS miles
  FROM trips t
  ${isDateRange ? getWhereClause([byDateRange.tripsQuery]) : ''}
  GROUP BY t.driver_id, "reportDay"
`;

const getDriversWorkOrdersQuery = ({
  byDateRange,
  byMaterialsStr,
  byActionStr,
  byStatusStr,
  byBU,
}) => `
  SELECT
    w.driver_id AS id,
    DATE(w.scheduled_date) AS "reportDay",
    ${buSelect(byBU)}
    COUNT(w.id) AS "woCount"
  FROM work_orders w
  ${getWhereClause([byDateRange.woQuery, byMaterialsStr, byActionStr, byStatusStr])}
  GROUP BY w.driver_id, "reportDay" ${buGroupBy(byBU)}
`;

const getDailyQuery = params => `
  SELECT
    wR.id AS id,
    tcR."reportDay",
    tcR.timecards,
    tcR.incomplete,
    tcR."startTime",
    tcR."stopTime",
    tcR."adjustedTime",
    tR."preTrip",
    tR.miles,
    ${buSelect(params?.byBU, 'wR')}
    wR."woCount"
  FROM
    (${getDriversTimecardsQuery(params)}) AS tcR,
    (${getDriversTripsQuery(params)}) AS tR,
    (${getDriversWorkOrdersQuery(params)}) AS wR
  ${getWhereClause([
    params.byDriversStr,
    'tcR.id = tR.id',
    'tcR."reportDay" = tR."reportDay"',
    'tR.id = wR.id',
    'tR."reportDay" = wR."reportDay"',
  ])}
`;

const getDateRangeQuery = params => `
  SELECT
    wR.id AS id,
    tcR.timecards,
    tcR.incomplete,
    tcR."adjustedTime",
    tR.miles,
    wR."woCount"
  FROM
      (${getDriversTimecardsQuery(params)}) AS tcR,
      (
        SELECT
          a.id,
          SUM(a.miles) as miles
        FROM (${getDriversTripsQuery(params)}) AS a
        GROUP BY a.id
      ) AS tR,
      (${getDriversWorkOrdersQuery(params)}) AS wR
  ${getWhereClause([params.byDriversStr, 'tcR.id = tR.id', 'tR.id = wR.id'])}
`;

const getRangeCanaryQuery = ({
  timezone,
  byDateRange,
  byDriversUnionStr,
  byDateRangeUnion,
  byBU,
}) => `
  SELECT
    t.id,
    t."reportDay",
    t.timecards,
    t.incomplete,
    t."startTime",
    t."stopTime",
    SUM(
        extract(epoch from t."stopTime")
        -
        extract(epoch from t."startTime")
    ) AS "adjustedTime",
    t."preTrip",
    t.miles,
    ${buSelect(byBU, 't')}
    t."woCount"
  FROM (
    SELECT
      w.driver_id AS id,
      0 AS timecards,
      0 AS incomplete,
      MIN(w.modified_date) AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}' AS "startTime",
      MAX(w.modified_date) AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}' AS "stopTime",
      MIN(w.modified_date) AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}' AS "preTrip",
      0 AS miles,
      DATE(w.scheduled_date) AS "reportDay",
      ${buSelect(byBU)}
      COUNT(w.id) AS "woCount"
    FROM work_orders AS w
    ${getWhereClause([
      byDateRange.woQuery,
      byDriversUnionStr,
      `w.driver_id NOT IN (
        SELECT t.driver_id FROM timecards AS t
         ${getWhereClause([byDateRangeUnion.timecardsQuery])}
      )`,
    ])}
    GROUP BY w.driver_id, w.scheduled_date ${buGroupBy(byBU)}
    ORDER BY w.driver_id ASC
  ) AS t
  GROUP BY
    t.id,
    t.timecards,
    t.incomplete,
    t."startTime",
    t."stopTime",
    t."preTrip",
    t.miles,
    t."reportDay",
    t."woCount" ${buGroupBy(byBU, 't')}
`;

const getDateRangeCanaryQuery = params => `
  (${getDateRangeQuery(params)})
  UNION
  (
    SELECT
      sub.id,
      sub.timecards,
      sub.incomplete,
      sub."adjustedTime",
      sub.miles,
      sub."woCount"
    FROM (${getRangeCanaryQuery(params)}) AS sub
  )
`;

const getDailyCanaryQuery = params => `
  (${getDailyQuery(params)})
  UNION
  (${getRangeCanaryQuery(params)})
`;

const getCansAgingQuery = ({ httpBefore, beforeDate, timezone }) => `
  SELECT
    c.name,
    c.serial,
    c.size,
    c.action,
    to_char(c.timestamp, ${reportHyphenDate}) AS timestamp,
    to_char(
      c.modified_date AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}',
      ${reportDateTime}
    ) AS "lastModified",
    w.customer_name AS customer,
    l.name AS address,
    abs(DATE_PART(
      'day',
      (c.timestamp AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}')::timestamp
      -
      (to_char(
        '${httpBefore}' AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}',
         ${reportDateTime}
      ))::timestamp
    )) AS "numberOfDays"
  FROM cans c
  LEFT OUTER JOIN locations l
    ON c.location_id = l.id
  LEFT OUTER JOIN work_orders w
    ON l.id = w.location_id_1
    AND c.size = w.size
    AND to_char(c.timestamp, ${reportHyphenDate}) = to_char(w.scheduled_date, ${reportHyphenDate})
    AND w.deleted = FALSE
  WHERE ${beforeDate} AND c.deleted = FALSE
  GROUP BY
    c.name,
    c.serial,
    c.size,
    c.action,
    c.timestamp,
    c.modified_date,
    w.customer_name,
    l.name
  ORDER BY c.timestamp asc
`;

const getWoNotesQuery = byDateRange => `
  SELECT
    id,
    note,
    work_order_id AS "workOrderId",
    type,
    created_by AS "createdBy",
    to_char(created_date, ${reportSlashDate}) AS date,
    created_date AS "createdDate"
  FROM wo_notes
  ${getWhereClause([byDateRange.rangeQuery])}
  ORDER BY date DESC
`;

const byStatusQuery = ({ status }) => {
  if (!status) {
    return ` w.status = 'COMPLETED' `;
  }
  const woStatuses = status.split(',');
  let res = `w.status = '${woStatuses[0]}'`;
  for (let i = 1; i < woStatuses.length; i++) {
    res += ` OR w.status = '${woStatuses[i]}'`;
  }
  return ` (${res}) `;
};

const byActionQuery = ({ action }) => {
  if (!action) {
    return '';
  }
  const woActions = action.split(',');
  let res = `w.action = '${woActions[0]}'`;
  for (let i = 1; i < woActions.length; i++) {
    res += ` OR w.action = '${woActions[i]}'`;
  }
  return ` (${res}) `;
};

const byDriversQuery = ({ driverId }) => {
  if (!driverId) {
    return '';
  }
  const ids = driverId.split(',');
  let res = `wR.id = ${ids[0]}`;
  for (let i = 1; i < ids.length; i++) {
    res += ` OR wR.id = ${ids[i]}`;
  }
  return ` (${res}) `;
};

const byDriversUnionQuery = ({ driverId }) => {
  if (!driverId) {
    return '';
  }
  const ids = driverId.split(',');
  let res = `w.driver_id = ${ids[0]}`;
  for (let i = 1; i < ids.length; i++) {
    res += ` OR w.driver_id = ${ids[i]}`;
  }
  return ` (${res}) `;
};

const byMaterialsQuery = ({ material }) => {
  if (!material) {
    return '';
  }
  const materialsAray = material.split(',');
  let res = `w.material = '${materialsAray[0]}'`;
  for (let i = 1; i < materialsAray.length; i++) {
    res += ` OR w.material = '${materialsAray[i]}'`;
  }
  return ` (${res}) `;
};

const byDateRangeQuery = ({ date, timezone }) => {
  if (R.test(dateRange.dateFormat, date)) {
    const result = {};
    const reportTime = date.split('..');
    result.woQuery = ` (w.scheduled_date BETWEEN '${reportTime[0]}' AND
      '${reportTime[1]}') `;
    result.timecardsQuery = ` (DATE(t.start_time AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}') BETWEEN
      '${reportTime[0]}' AND '${reportTime[1]}') `;
    result.tripsQuery = ` (DATE(t.created_date AT TIME ZONE 'UTC' AT TIME ZONE '${timezone}') BETWEEN
      '${reportTime[0]}' AND '${reportTime[1]}') `;
    return result;
  }
  return {
    woQuery: '',
    timecardsQuery: '',
    tripsQuery: '',
  };
};

const byDateRangeNotesQuery = ({ date }) => {
  if (R.test(dateRange.dateFormat, date)) {
    const result = {};

    const reportTime = date.split('..');
    const firstDate = format(reportTime[0], 'YYYY-MM-DD');
    const secondDate = format(reportTime[1], 'YYYY-MM-DD');
    result.rangeQuery = ` (DATE(wo_notes.created_date) BETWEEN '${firstDate}' AND '${secondDate}') `;
    return result;
  }
  return {
    rangeQuery: '',
  };
};

// Report is non-updated master report, eventually will be replaced by canary report
export const dateRangeReport = R.curry((httpQuery, query) => {
  const { timezone } = httpQuery;
  debug(timezone);
  validateTimezone(timezone);

  const byDriversStr = byDriversQuery(httpQuery);
  const byDateRange = byDateRangeQuery(httpQuery);
  const byMaterialsStr = byMaterialsQuery(httpQuery);
  const byActionStr = byActionQuery(httpQuery);
  const byStatusStr = byStatusQuery(httpQuery);

  const dateRangeReportQuery = getDateRangeQuery({
    byDriversStr,
    byDateRange,
    byMaterialsStr,
    byActionStr,
    byStatusStr,
    timezone,
    isDateRange: true,
  });
  return query(buildQueryObj(dateRangeReportQuery));
});

// Report below to replace dateRangeReport, pushing live for real data testing
// adds in rows of drivers who have done work for the day but do not have timecards (aka no clock in)
export const dateRangeCanaryReport = R.curry((httpQuery, query) => {
  const { timezone } = httpQuery;
  debug(timezone);
  validateTimezone(timezone);

  const byDriversStr = byDriversQuery(httpQuery);
  const byDriversUnionStr = byDriversUnionQuery(httpQuery);
  const byDateRange = byDateRangeQuery(httpQuery);
  const byMaterialsStr = byMaterialsQuery(httpQuery);
  const byActionStr = byActionQuery(httpQuery);
  const byStatusStr = byStatusQuery(httpQuery);
  const byDateRangeUnion = byDateRangeQuery(httpQuery);

  const dateRangeCanaryQuery = getDateRangeCanaryQuery({
    byDriversStr,
    byDriversUnionStr,
    byDateRange,
    byMaterialsStr,
    byActionStr,
    byStatusStr,
    byDateRangeUnion,
    timezone,
    isDateRange: true,
  });
  return query(buildQueryObj(dateRangeCanaryQuery));
});

// Report is non-updated master report, eventually will be replaced by canary report
export const dailyReport = R.curry((httpQuery, query) => {
  const { timezone } = httpQuery;
  debug(timezone);
  validateTimezone(timezone);

  const byDriversStr = byDriversQuery(httpQuery);
  const byDateRange = byDateRangeQuery(httpQuery);
  const byMaterialsStr = byMaterialsQuery(httpQuery);
  const byActionStr = byActionQuery(httpQuery);
  const byStatusStr = byStatusQuery(httpQuery);

  const dailyReportQuery = getDailyQuery({
    byDriversStr,
    byDateRange,
    byMaterialsStr,
    byActionStr,
    byStatusStr,
    timezone,
  });
  return query(buildQueryObj(dailyReportQuery));
});

// Report below to replace dailyReport, pushing live for real data testing
// adds in rows of drivers who have done work for the day but do not have timecards (aka no clock in)
export const dailyCanaryReport = R.curry((httpQuery, query) => {
  const { timezone } = httpQuery;
  debug(timezone);
  validateTimezone(timezone);

  const byDriversStr = byDriversQuery(httpQuery);
  const byDriversUnionStr = byDriversUnionQuery(httpQuery);
  const byDateRange = byDateRangeQuery(httpQuery);
  const byDateRangeUnion = byDateRangeQuery(httpQuery);
  const byMaterialsStr = byMaterialsQuery(httpQuery);
  const byActionStr = byActionQuery(httpQuery);
  const byStatusStr = byStatusQuery(httpQuery);

  const dailyCanaryQuery = getDailyCanaryQuery({
    byDriversStr,
    byDriversUnionStr,
    byDateRange,
    byDateRangeUnion,
    byMaterialsStr,
    byActionStr,
    byStatusStr,
    timezone,
  });
  return query(buildQueryObj(dailyCanaryQuery));
});

export const cansAgingReport = R.curry((httpQuery, query) => {
  const { timezone } = httpQuery;
  debug(timezone);
  validateTimezone(timezone);

  const httpBefore = format(
    endOfDay(utcToZonedTime(httpQuery.beforeDate, 'UTC')),
    'YYYY-MM-DD hh:mm:ss',
  );
  const beforeDate = httpQuery.beforeDate
    ? `c.timestamp < '${format(httpQuery.beforeDate, 'YYYY-MM-DD')}'`
    : 'TRUE';

  // numberOfDays calculates days between input day requested and can timestamp
  const cansAgingQuery = getCansAgingQuery({
    timezone,
    httpBefore,
    beforeDate,
  });
  return query(buildQueryObj(cansAgingQuery));
});

export const woNotesReport = R.curry((httpQuery, query) => {
  const byDateRange = byDateRangeNotesQuery(httpQuery);
  const woNotesQuery = getWoNotesQuery(byDateRange);
  return query(buildQueryObj(woNotesQuery));
});

export default {
  dailyReport,
  dailyCanaryReport,
  dateRangeCanaryReport,
  dateRangeReport,
  cansAgingReport,
  woNotesReport,
  getDailyCanaryQuery,
};
