import RecyclingOrderMapper from '../../../mappers/RecyclingOrderMapper.js';

import { recyclingOrder } from '../../fixtures/recyclingOrder.js';

describe('RecyclingOrderMapper', () => {
  describe('mapRecyclingOrderToWeightTicket', () => {
    it('should map recycling order to weightTicket properly', () => {
      const expectedResult = {
        ticketNumber: '135',
        dailyRouteId: 434,
        recyclingBusinessUnitId: 1,
        loadValue: 2,
        weightUnit: 'tons',
        disposalSiteId: 1,
        materialId: 3,
        arrivalTime: '2021-11-16T12:33:26.430Z',
        departureTime: '2021-11-16T12:35:02.737Z',
        timeOnLandfill: new Date(
          new Date(recyclingOrder.departureAt).getTime() -
            new Date(recyclingOrder.arrivedAt).getTime(),
        ).toUTCString(),
        authorId: 'system',
        authorName: 'system',
      };

      const result = RecyclingOrderMapper.mapRecyclingOrderToWeightTicket(recyclingOrder);

      expect(result).toStrictEqual(expectedResult);
    });

    it('should throw error if weightUnit does not support', () => {
      let expectedError = null;
      const fakeUnit = 'fakeUnit';
      const localRecyclingOrder = { ...recyclingOrder, weightInUnit: fakeUnit };

      try {
        RecyclingOrderMapper.mapRecyclingOrderToWeightTicket(localRecyclingOrder);
      } catch (error) {
        expectedError = error;
      }

      expect(expectedError.message).toBe(`Weight unit ${fakeUnit} is not supported`);
    });
  });

  describe('mapRecyclingOrderToWeightTicketMedia', () => {
    it('should map recycling order to weightTicketMedia properly', () => {
      const result = RecyclingOrderMapper.mapRecyclingOrderToWeightTicketMedia(recyclingOrder);
      delete result.id;

      const expectedResult = {
        author: 'test1991tet@gmail.com',
        fileName: 'weight-ticket-135.pdf',
        timestamp: '2021-11-16T12:35:21.074Z',
        url: 'PRIVATE_MEDIA_URL',
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
