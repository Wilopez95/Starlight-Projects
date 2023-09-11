import R from 'ramda';
import { format } from 'date-fns';
import cans from '../../tables/cans.js';
import { getLocation } from '../../models/locations.js';
import { create } from '../../models/sizes.js';
import { invalidInput } from '../../utils/errors.js';
import { csvDateFrmt } from '../../utils/format.js';
import importer from '../../middlewares/importer.js';

export const csvHeader = ['Id', 'Serial', 'Size', 'Name', 'Start Date', 'Source', 'Location'];

const assoc = id => R.compose(R.omit(['id']), R.assoc('locationId', id));

export default importer({
  validate: R.compose(
    R.map(row => {
      if (row.length < 7) {
        throw invalidInput(`
        Wrong format, CSV should contain 7 columns:
        id (optional), serial, size, name, startDate, source, address
      `);
      }
      return row;
    }),
    R.filter(row => R.join(',', row) !== R.join(',', csvHeader)),
  ),

  mapCSV: R.map(([id, serial, size, name, startDate, source, address]) => [
    {
      name: address,
      geocoding: true,
    },
    {
      id,
      serial,
      size,
      name,
      source,
      startDate: startDate ? format(startDate, csvDateFrmt) : undefined,
    },
  ]),

  importers: {
    async append(user, query, [locSeed, canSeed]) {
      canSeed.haulingBusinessUnitId = user.businessUnitId;
      const location = await getLocation(locSeed, user, query);
      await create({ name: canSeed.size }, user, query);
      await query(cans.insert(assoc(location.id)(canSeed)));
    },

    async update(user, query, [locSeed, canSeed]) {
      if (!canSeed.id) {
        return;
      }
      const location = await getLocation(locSeed, user, query);
      await create({ name: canSeed.size }, user, query);
      await query(cans.update(assoc(location.id)(canSeed)).where({ id: canSeed.id }));
    },

    async delete(user, query, [, canSeed]) {
      if (!canSeed.id) {
        return;
      }
      await query(cans.update(R.assoc('deleted', 1, canSeed)).where({ id: canSeed.id }));
    },
  },
});
