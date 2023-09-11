import { getAvailableColor } from '../../../utils/colorHelper.js';
import { TABLES } from '../../../consts/tables.js';

import DailyRoute from '../../../models/dailyRoute.js';

jest.mock('../../../utils/colorHelper.js');
jest.mock('../../../services/hauling.js');
jest.mock('../../../services/amqp/syncWosToHauling/index.js');

const DEFAULT_SCHEMA = 'admin';

describe('DailyRoute', () => {
  describe('getAvailableColor', () => {
    it('should call getAvailableColor helper with outerTransaction as param if it was provided', async () => {
      const fakeTransaction = jest.fn();

      await DailyRoute.getAvailableColor(fakeTransaction);

      expect(getAvailableColor).toHaveBeenCalledWith(
        DEFAULT_SCHEMA,
        TABLES.DAILY_ROUTES,
        fakeTransaction,
      );
    });

    it('should call getAvailableColor helper with undefined as param if outerTransaction was NOT provided', async () => {
      await DailyRoute.getAvailableColor();

      expect(getAvailableColor).toHaveBeenCalledWith(
        DEFAULT_SCHEMA,
        TABLES.DAILY_ROUTES,
        undefined,
      );
    });
  });
});
