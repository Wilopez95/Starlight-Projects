import WorkOrderMapper from '../../../mappers/WorkOrderMapper.js';

import { haulingSubscriptionWorkOrderDetails } from '../../fixtures/haulingSubscriptionWorkOrderDetails.js';
import { haulingIndependentOrderDetails } from '../../fixtures/haulingIndependentWorkOrderDetails.js';
import { haulingSubscriptionWorkOrders } from '../../fixtures/haulingSubscriptionWorkOrders.js';
import { haulingIndependentWorkOrders } from '../../fixtures/haulingIndependentWorkOrders.js';

describe('WorkOrderMapper', () => {
  describe('mapSubscriptionWorkOrdersFromHauling', () => {
    it('should map hauling subscription work order properly', () => {
      const result = WorkOrderMapper.mapSubscriptionWorkOrdersFromHauling({
        subscriptionWorkOrders: haulingSubscriptionWorkOrders,
        subscriptionWorkOrderDetails: haulingSubscriptionWorkOrderDetails,
      });

      const expectedResult = [
        {
          alleyPlacement: false,
          bestTimeToComeFrom: '00:00',
          bestTimeToComeTo: '23:59',
          billableServiceDescription: 'not a service',
          billableServiceId: 2650,
          businessLineId: 35,
          businessUnitId: 2,
          customerId: 165,
          displayId: '2350.10.1',
          orderDisplayId: '2350.10',
          droppedEquipment: 'dropped equipment item',
          equipmentItemId: 29,
          equipmentItemSize: null,
          highPriority: false,
          instructionsForDriver: 'instruction for driver',
          isIndependent: false,
          jobSiteId: 266,
          jobSiteNote: 'job site note',
          materialId: 1,
          orderId: 50572,
          permitRequired: false,
          phoneNumber: '1-959-559-5555',
          pickedUpEquipment: 'picked equipment item',
          poRequired: false,
          preferredRoute: null,
          serviceAreaId: 70,
          serviceDate: '2021-09-01T00:00:00.000Z',
          serviceItemId: 5377,
          signatureRequired: false,
          someoneOnSite: false,
          status: 'COMPLETED',
          completedAt: '2021-10-04T10:07:22.059Z',
          subscriptionId: 2350,
          thirdPartyHaulerDescription: 'third party hauler description',
          thirdPartyHaulerId: 1,
          toRoll: false,
          workOrderId: 71068,
        },
      ];

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('mapIndependentWorkOrdersFromHauling', () => {
    it('should map hauling independent work order properly', () => {
      const result = WorkOrderMapper.mapIndependentWorkOrdersFromHauling({
        independentWorkOrders: haulingIndependentWorkOrders,
        independentWorkOrderDetails: haulingIndependentOrderDetails,
      });

      const expectedResult = [
        {
          alleyPlacement: true,
          bestTimeToComeFrom: '00:00',
          bestTimeToComeTo: '23:59',
          billableServiceDescription: 'Delivery H-1225',
          billableServiceId: 1340,
          businessLineId: 4,
          businessUnitId: 40,
          customerId: 142,
          displayId: '1251556',
          orderDisplayId: '1251',
          droppedEquipment: 'dropped equipment item',
          equipmentItemId: 2,
          equipmentItemSize: 20,
          highPriority: false,
          instructionsForDriver: null,
          isIndependent: true,
          jobSiteId: 227,
          jobSiteNote: null,
          materialId: 1,
          orderId: 1251,
          permitRequired: false,
          phoneNumber: '1-233-344-5556',
          pickedUpEquipment: 'picked equipment item',
          poRequired: true,
          preferredRoute: null,
          serviceAreaId: 49,
          serviceDate: '2021-09-02T10:07:22.059Z',
          signatureRequired: false,
          someoneOnSite: false,
          status: 'COMPLETED',
          completedAt: '2021-10-04T10:07:22.059Z',
          thirdPartyHaulerDescription: 'Billy3rdParty.active',
          thirdPartyHaulerId: 6,
          toRoll: false,
          workOrderId: 556,
        },
      ];

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
