import { attachWeightTicketFromRecyclingToDailyRoute } from '../../../../services/amqp/subscriptions.js';

import RecyclingOrderMapperMock from '../../../../mappers/RecyclingOrderMapper.js';
import { getScopedContextModels as getScopedContextModelsMock } from '../../../../utils/getScopedModels.js';
import WeightTicketMock from '../../../../models/weightTicket.js';

import { fakeСtx } from '../../../commonEntities.js';

jest.mock('../../../../utils/getScopedModels.js');
jest.mock('../../../../mappers/RecyclingOrderMapper.js');
jest.mock('../../../../models/weightTicket.js');

describe('services/amqp/subscriptions', () => {
  describe('attachWeightTicketFromRecyclingToDailyRoute', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      getScopedContextModelsMock.mockReturnValueOnce({ WeightTicket: WeightTicketMock });
    });

    const fakeRecyclingOrder = { id: 1, WONumber: 'DR123', businessUnitId: 1 };

    it('should map incoming data to weightTicket', async () => {
      await attachWeightTicketFromRecyclingToDailyRoute(fakeСtx, fakeRecyclingOrder);

      expect(RecyclingOrderMapperMock.mapRecyclingOrderToWeightTicket).toHaveBeenCalledWith(
        fakeRecyclingOrder,
      );
    });

    it('should map incoming data to weightTicketMedia', async () => {
      await attachWeightTicketFromRecyclingToDailyRoute(fakeСtx, fakeRecyclingOrder);

      expect(RecyclingOrderMapperMock.mapRecyclingOrderToWeightTicketMedia).toHaveBeenCalledWith(
        fakeRecyclingOrder,
      );
    });

    it('should create weightTicket with mapped data and IS_AUTO_ATTACH_FROM_RECYCLING flag', async () => {
      const mappedWeightTicket = { ticketNumber: 1 };
      const mappedWeightTicketMedia = { id: 'uuidv4' };
      const IS_AUTO_ATTACH_FROM_RECYCLING = true;

      RecyclingOrderMapperMock.mapRecyclingOrderToWeightTicket.mockReturnValueOnce(
        mappedWeightTicket,
      );
      RecyclingOrderMapperMock.mapRecyclingOrderToWeightTicketMedia.mockReturnValueOnce(
        mappedWeightTicketMedia,
      );

      await attachWeightTicketFromRecyclingToDailyRoute(fakeСtx, fakeRecyclingOrder);

      expect(WeightTicketMock.create).toHaveBeenCalledWith(
        mappedWeightTicket,
        mappedWeightTicketMedia,
        IS_AUTO_ATTACH_FROM_RECYCLING,
      );
    });
  });
});
