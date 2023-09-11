import R from 'ramda';
import csv from 'csv';
import { Router } from 'express';
import _debug from 'debug';
import groupBy from 'lodash/groupBy.js';

import driversReportView from '../views/reports.js';
import { my } from '../utils/query.js';
import { promisify } from '../utils/functions.js';
import asyncWrap from '../utils/asyncWrap.js';
import {
  dailyReport,
  dailyCanaryReport,
  dateRangeReport,
  dateRangeCanaryReport,
  cansAgingReport,
  woNotesReport,
} from '../models/reports.js';
import { getHaulingDrivers } from '../services/hauling/drivers.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';

const { dispatcher } = ACTIONS;
const debug = _debug('api:routes:reports');

export const byDayReportHeader = {
  id: 'Id',
  name: 'Driver',
  date: 'Date',
  startTime: 'In',
  stopTime: 'Out',
  workTime: 'Adjusted Hours',
  time: 'Total Hours',
  timecards: 'Time Cards',
  incomplete: 'Incomplete Time Cards',
  woCount: 'Hauls',
  hoursPerWO: 'HPH',
  miles: 'Miles',
  milesPerWO: 'MPH',
  preTrip: 'Depart Yard',
  preTripDuration: 'Pre-trip',
};

export const byDateRangeReportHeader = {
  id: 'Id',
  name: 'Driver',
  workTime: 'Adjusted Hours',
  timecards: 'Time Cards',
  incomplete: 'Incomplete Time Cards',
  woCount: 'Hauls',
  hoursPerWO: 'HPH',
  miles: 'Miles',
  milesPerWO: 'MPH',
};

export const cansAgingReportHeader = {
  name: 'Can Number',
  serial: 'Serial',
  size: 'Size',
  action: 'Action',
  timestamp: 'Timestamp',
  lastModified: 'Last Updated',
  customer: 'Customer',
  address: 'Address',
  numberOfDays: 'Number of Days',
};

export const workOrderNoteReportHeader = {
  id: 'ID',
  note: 'Note',
  workORderId: 'WorkOrder ID',
  type: 'Type',
  createdBy: 'Person',
  createdDate: 'Date',
};

const router = new Router();

const attachDriversNames = async (req, data) => {
  if (!data?.length) {
    return data;
  }

  let driversById;
  const driverIds = R.compose(R.filter(Boolean), R.map(R.prop('id')))(data);

  if (driverIds?.length) {
    const drivers = await getHaulingDrivers(req, { driverIds });
    driversById = groupBy(drivers, 'id');
  }

  return R.map(item => {
    const driver = driversById?.[item.id]?.[0];
    item.name = driver?.description ?? null;
    return item;
  }, data);
};

const bydailyDriverQueryHandler = asyncWrap(async (req, res) => {
  const { user } = req;
  let drivers = await my(dailyReport({ ...req.query }), user);
  drivers = await attachDriversNames(req, drivers);
  const reportData = R.map(driversReportView, drivers);

  res.status(200).json(reportData);
});

const byDayReport = asyncWrap(async (req, res) => {
  const { user } = req;
  let drivers = await my(dailyReport({ ...req.query }), user);
  drivers = await attachDriversNames(req, drivers);
  const reportData = R.map(driversReportView, drivers);
  reportData.unshift(byDayReportHeader);
  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.map(
          driver => [
            driver.id,
            driver.name,
            driver.date,
            driver.startTime,
            driver.stopTime,
            driver.workTime,
            driver.time,
            driver.timecards,
            driver.incomplete,
            driver.woCount,
            driver.hoursPerWO,
            driver.miles,
            driver.milesPerWO,
            driver.preTrip,
            driver.preTripDuration,
          ],
          reportData,
        ),
        cb,
      ),
    ),
  );
});

const byDayCanaryReport = asyncWrap(async (req, res) => {
  const { user } = req;
  let drivers = await my(dailyCanaryReport({ ...req.query }), user);
  drivers = await attachDriversNames(req, drivers);
  const reportData = R.map(driversReportView, drivers);
  reportData.unshift(byDayReportHeader);
  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.map(
          driver => [
            driver.id,
            driver.name,
            driver.date,
            driver.startTime,
            driver.stopTime,
            driver.workTime,
            driver.time,
            driver.timecards,
            driver.incomplete,
            driver.woCount,
            driver.hoursPerWO,
            driver.miles,
            driver.milesPerWO,
            driver.preTrip,
            driver.preTripDuration,
          ],
          reportData,
        ),
        cb,
      ),
    ),
  );
});

const byDateRangeReport = asyncWrap(async (req, res) => {
  const { user } = req;
  let drivers = await my(dateRangeReport({ ...req.query }), user);
  drivers = await attachDriversNames(req, drivers);
  debug('byDateRangeReport drivers Query: \n', drivers);
  const reportData = R.map(driversReportView, drivers);
  reportData.unshift(byDateRangeReportHeader);
  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.map(
          driver => [
            driver.id,
            driver.name,
            driver.workTime,
            driver.timecards,
            driver.incomplete,
            driver.woCount,
            driver.hoursPerWO,
            driver.miles,
            driver.milesPerWO,
          ],
          reportData,
        ),
        cb,
      ),
    ),
  );
});

const byDateRangeCanaryReport = asyncWrap(async (req, res) => {
  const { user } = req;
  let drivers = await my(dateRangeCanaryReport({ ...req.query }), user);
  drivers = await attachDriversNames(req, drivers);
  debug('byDateRangeCanaryReport drivers Query: \n', drivers);
  const reportData = R.map(driversReportView, drivers);
  reportData.unshift(byDateRangeReportHeader);
  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.map(
          driver => [
            driver.id,
            driver.name,
            driver.workTime,
            driver.timecards,
            driver.incomplete,
            driver.woCount,
            driver.hoursPerWO,
            driver.miles,
            driver.milesPerWO,
          ],
          reportData,
        ),
        cb,
      ),
    ),
  );
});

const cansAgingReportHandler = asyncWrap(async (req, res) => {
  const { user } = req;
  const cans = await my(cansAgingReport({ ...req.query }), user);
  cans.unshift(cansAgingReportHeader);

  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.map(
          can => [
            can.name,
            can.serial,
            can.size,
            can.action,
            can.timestamp,
            can.lastModified,
            can.customer,
            can.address,
            can.numberOfDays,
          ],
          cans,
        ),
        cb,
      ),
    ),
  );
});

const woNotesByDateRangeReportHandler = asyncWrap(async (req, res) => {
  const { user } = req;
  const notes = await my(woNotesReport({ ...req.query }), user);
  notes.unshift(workOrderNoteReportHeader);

  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.map(
          note => [note.id, note.note, note.workOrderId, note.type, note.createdBy, note.date],
          notes,
        ),
        cb,
      ),
    ),
  );
});

router.route('/drivers').get(
  authorized([dispatcher.access]),
  asyncWrap((req, res, next) => {
    const {
      query: { reportType },
    } = req;

    switch (reportType) {
      case 'byDay':
        return byDayReport(req, res, next);
      case 'byDateRange':
        return byDateRangeReport(req, res, next);
      case 'byDayCanary':
        return byDayCanaryReport(req, res, next);
      case 'byDateRangeCanary':
        return byDateRangeCanaryReport(req, res, next);
      default:
        return res.status(200).send();
    }
  }),
);

router.route('/hauls').get(authorized([dispatcher.access]), bydailyDriverQueryHandler);

router.route('/cans-aging').get(authorized([dispatcher.access]), cansAgingReportHandler);

router
  .route('/workorder-notes')
  .get(authorized([dispatcher.access]), woNotesByDateRangeReportHandler);

export default router;
