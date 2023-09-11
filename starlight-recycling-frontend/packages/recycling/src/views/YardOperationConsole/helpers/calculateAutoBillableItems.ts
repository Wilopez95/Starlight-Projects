import {
  GetHaulingBillableItemsQuery,
  GetOrderQuery,
  OrderBillableItemFragmentFragment,
} from '../../../graphql/api';
import createDecorator from 'final-form-calculate';
import { cloneDeep, keyBy, keys } from 'lodash-es';
import { preventUpdate } from './utils';

export const calculateAutoBillableItems = (
  miscBillableItems: GetHaulingBillableItemsQuery['getHaulingBillableItems'],
  prefetchedMiscItems: Record<string, OrderBillableItemFragmentFragment>,
) =>
  createDecorator({
    field: /miscellaneousMaterialsDistribution\[\d+\].quantity/,
    isEqual: preventUpdate,
    updates: {
      billableItems: (value, state: any) => {
        const { billableItems, miscellaneousMaterialsDistribution } = state;

        const autoOrderBillableItems = (billableItems as GetOrderQuery['order']['billableItems']).filter(
          (bi) => bi.auto,
        );

        const materialsDistributionMap = keyBy(miscellaneousMaterialsDistribution, 'materialId');
        const distributionMaterialIds = keys(materialsDistributionMap);
        const obiMap = keyBy(
          cloneDeep(autoOrderBillableItems),
          (obi) => `${obi.billableItemId}:${obi.materialId}`,
        );

        for (const hbi of miscBillableItems) {
          if (!hbi.materialBasedPricing) {
            continue;
          }
          for (const materialId of distributionMaterialIds) {
            if (hbi.materialIds?.includes(Number(materialId))) {
              const quantity = Number(materialsDistributionMap[materialId].quantity);
              const key = `${hbi.id}:${materialId}`;

              if (quantity > 0) {
                obiMap[key] = {
                  ...obiMap[key],
                  ...prefetchedMiscItems[key],
                  quantity,
                  materialId: Number(materialId) || undefined,
                  material: materialsDistributionMap[materialId]?.material,
                };
              } else {
                delete obiMap[key];
              }
            }
          }
        }

        const autoBillableItems = Object.values(obiMap);

        if (autoOrderBillableItems.length === 0 && autoBillableItems.length === 0) {
          return billableItems;
        }

        return (billableItems as GetOrderQuery['order']['billableItems'])
          .filter((bi) => !bi.auto)
          .concat(autoBillableItems);
      },
    },
  });
