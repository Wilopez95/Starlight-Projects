import R from 'ramda';
import workOrders from '../../tables/workorders.js';
import { getLocation } from '../../models/locations.js';
import { invalidInput } from '../../utils/errors.js';
import { foldP } from '../../utils/functions.js';
import importer from '../../middlewares/importer.js';

export const csvHeader = [
  'Id',
  'Action',
  'Status',
  'Size',
  'Material',
  'Scheduled Date',
  'Scheduled Start',
  'Scheduled End',
  'Contact Name',
  'Contact Number',
  'Location 1',
  'Location 2',
  'Priority',
  'Step',
  'Permit Number',
  'Customer Name',
  'Driver Name',
];

const process = (user, query, locSeeds, woSeed) =>
  R.pipeP(
    foldP(async (ac, seed) => [...ac, await getLocation(seed, user, query)], []),
    R.addIndex(R.map)(({ id }, key) => ({ [`locationId${R.inc(key)}`]: id })),
    R.apply(R.merge),
    R.merge(woSeed),
    R.omit(['id']),
  )(locSeeds);

export default importer({
  validate: R.compose(
    R.map(row => {
      if (row.length < 15) {
        throw invalidInput(`
        Wrong format, CSV should contain 15 columns:
        id (optional), action, status, size, material,
        scheduled date, scheduled start, scheduled end,
        contact name, contact number, address 1, address 2,
        priority, progress step, permitNumber
      `);
      }
      return row;
    }),
    R.filter(row => R.join(',', row) !== R.join(',', csvHeader)),
  ),

  mapCSV: R.map(
    ([
      id,
      action,
      status,
      size,
      material,
      scheduledDate,
      scheduledStart,
      scheduledEnd,
      contactName,
      contactNumber,
      address1,
      address2,
      priority,
      step,
      permitNumber,
    ]) => [
      [
        {
          name: address1,
          geocoding: true,
        },
        {
          name: address2,
          geocoding: true,
        },
      ],
      {
        id,
        action,
        status,
        size,
        material,
        contactName,
        contactNumber,
        priority,
        step,
        permitNumber,
        scheduledDate,
        //  sometimes mysql converts '' to '00:00:00' this fixes it.
        //  definitely not standard behavior, could be driver related.
        scheduledStart: scheduledStart === '' ? null : scheduledStart,
        scheduledEnd: scheduledEnd === '' ? null : scheduledEnd,
      },
    ],
  ),

  importers: {
    async append(user, query, [locSeeds, woSeed]) {
      woSeed.haulingBusinessUnitId = user.businessUnitId;
      await query(workOrders.insert(await process(user, query, locSeeds, woSeed)));
    },

    async update(user, query, [locSeeds, woSeed]) {
      if (!woSeed.id) {
        return;
      }
      await query(
        workOrders.update(await process(user, query, locSeeds, woSeed)).where({ id: woSeed.id }),
      );
    },

    async delete(user, query, [, woSeed]) {
      if (!woSeed.id) {
        return;
      }
      await query(workOrders.update(R.assoc('deleted', 1, woSeed)).where({ id: woSeed.id }));
    },
  },
});
