import GlobalRatesServiceRepo from '../../repos/globalRatesService.js';
import CustomGroupRatesServiceRepo from '../../repos/customRatesGroupService.js';

import ApiError from '../../errors/ApiError.js';
import { globalRatesNotFound } from '../../errors/subscriptionErrorMessages.js';

export const getRates = async (
  ctxState,
  { subscription, serviceItem, service, originalIdsMap },
) => {
  // TODO: clarify how
  // https://github.com/Starlightpro/starlight-hauling-backend/pull/851/files
  // applies here. We have to link to historical records
  const [globalRatesService, customRatesGroupService] = await Promise.all([
    GlobalRatesServiceRepo.getHistoricalInstance(ctxState).getRecentBy({
      condition: {
        businessUnitId: subscription.businessUnitId,
        businessLineId: subscription.businessLineId,
        billableServiceId: service.id,
        equipmentItemId: service.equipmentItemId,
        materialId: originalIdsMap.materials[serviceItem.materialId],
      },
      fields: ['id', 'price'],
    }),
    subscription.customRatesGroupId
      ? CustomGroupRatesServiceRepo.getHistoricalInstance(ctxState).getRecentBy({
          condition: {
            customRatesGroupId: subscription.customRatesGroupId,
            businessUnitId: subscription.businessUnitId,
            businessLineId: subscription.businessLineId,
            billableServiceId: service.id,
            equipmentItemId: service.equipmentItemId,
            materialId: originalIdsMap.materials[serviceItem.materialId],
          },
          fields: ['id', 'price'],
        })
      : Promise.resolve(null),
  ]);

  if (!globalRatesService) {
    throw ApiError.notFound(globalRatesNotFound(service.description));
  }
  return { globalRatesService, customRatesGroupService };
};
