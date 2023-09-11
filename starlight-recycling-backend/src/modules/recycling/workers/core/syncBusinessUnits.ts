import { businessUnitsObservable } from '../../../../services/core/business_units';
import { createFacilitySrn } from '../../../../utils/srn';
import { populateEntityQueue } from '../../queues/populateEntity';
import { getFacilityEntitiesAndConnection } from '../../utils/facilityConnection';

businessUnitsObservable.subscribe(async (businessUnitEvent) => {
  const { id, tenantName } = businessUnitEvent;
  const srn = createFacilitySrn({
    tenantName,
    businessUnitId: id,
  });

  // run migrations
  await getFacilityEntitiesAndConnection(srn);

  await populateEntityQueue.add('populate-entity', {
    resource: srn,
    name: 'Order',
  });
  await populateEntityQueue.add('populate-entity', {
    resource: srn,
    name: 'CustomerTruck',
  });
});
