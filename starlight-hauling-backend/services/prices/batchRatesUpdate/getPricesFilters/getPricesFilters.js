import map from 'lodash/fp/map.js';

import MaterialRepository from '../../../../repos/material.js';
import BillableServiceRepository from '../../../../repos/billableService.js';
import EquipmentItemRepository from '../../../../repos/equipmentItem.js';
import BillableLineItemRepository from '../../../../repos/billableLineItem.js';
import PriceGroupRepository from '../../../../repos/priceGroups.js';

const pluckId = map('id');

const getPriceFilters = async (
  ctxState,
  { servicesFilters, businessLineId, businessUnitId, application, applyTo },
  trx,
  {
    MaterialRepo = MaterialRepository,
    BillableServiceRepo = BillableServiceRepository,
    EquipmentItemRepo = EquipmentItemRepository,
    BillableLineItemRepo = BillableLineItemRepository,
    PriceGroupRepo = PriceGroupRepository,
  },
) => {
  const fields = ['id'];

  const promises = [
    PriceGroupRepo.getInstance(ctxState).getRatesByApplication(
      {
        condition: {
          businessLineId,
          businessUnitId,
          application,
          applyTo,
        },
        fields,
      },
      trx,
    ),
  ];

  const repos = {
    lineItems: BillableLineItemRepo,
    services: BillableServiceRepo,
    equipmentItems: EquipmentItemRepo,
    materials: MaterialRepo,
  };

  promises.push(
    ...Object.entries(repos).map(([service, repo]) =>
      servicesFilters[service].getAll
        ? repo.getInstance(ctxState).getAll({ fields, condition: { businessLineId } }, trx)
        : Promise.resolve(),
    ),
  );

  const [ratesGroups, billableLineItems, billableServices, equipmentItems, materials] =
    await Promise.all(promises);

  return {
    priceGroupsIds: pluckId(ratesGroups) || [],
    lineItemIds: billableLineItems?.length
      ? pluckId(billableLineItems)
      : servicesFilters.lineItems.ids,
    servicesIds: billableServices?.length
      ? pluckId(billableServices)
      : servicesFilters.services.ids,
    equipmentItemIds: equipmentItems?.length
      ? pluckId(equipmentItems)
      : servicesFilters.equipmentItems.ids,
    materialIds: materials?.length ? pluckId(materials) : servicesFilters.materials.ids,
  };
};

export default getPriceFilters;
