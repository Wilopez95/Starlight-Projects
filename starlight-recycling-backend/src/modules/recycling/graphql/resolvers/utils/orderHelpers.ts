import {
  OrderBillableItem,
  OrderBillableItemInput,
  OrderBillableItemType,
} from '../../../entities/OrderBillableItem';
import { HaulingMeasurementUnit } from '../../../../../services/core/types/HaulingCompany';
import { OrderThresholdInput } from '../../../../../services/core/haulingOrder';
import { assign, differenceBy, isEmpty, isNil, keyBy, pick, values } from 'lodash';
import { ApolloError } from 'apollo-server-koa';
import { convertItem } from './convertWeights';
import {
  OrderMaterialDistributionInput,
  OrderMiscellaneousMaterialDistributionInput,
} from '../../types/GradingPayload';
import Order from '../../../entities/Order';
import { QueryContext } from '../../../../../types/QueryContext';
import getContextualizedEntity from '../../../../../utils/getContextualizedEntity';
import { OrderMaterialDistribution } from '../../../entities/OrderMaterialDistribution';
import { OrderMiscellaneousMaterialDistribution } from '../../../entities/OrderMiscellaneousMaterialDistribution';
import { materialService } from '../../../../../services/core/haulingMaterials';
import {
  getOrderMaterialDistribution,
  getOrderMiscellaneousMaterialDistribution,
} from './getOrderMaterialDistribution';

export const getMeasurementUnitFromMaterial = (materialUnit: string): HaulingMeasurementUnit => {
  switch (materialUnit) {
    case 'long_tons':
      return HaulingMeasurementUnit.imperial;
    case 'short_tons':
      return HaulingMeasurementUnit.us;
    default:
      return HaulingMeasurementUnit.metric;
  }
};

export const convertOrderBillableItemToThresholdInput = (
  materialBillableItem: OrderBillableItem,
  unit?: HaulingMeasurementUnit,
): OrderThresholdInput => {
  const input = pick(materialBillableItem, ['thresholdId', 'price', 'quantity']);

  if (values(input).some(isNil)) {
    throw new ApolloError('Failed to convert order billable item to threshold input', '400');
  }

  if (
    isNil(
      materialBillableItem.customRatesGroupThresholdsId ??
        materialBillableItem.globalRatesThresholdsId,
    )
  ) {
    throw new ApolloError('Threshold price is not defined in global rates configurations');
  }

  return {
    ...input,
    quantity: convertItem(Number(input.quantity), unit),
    customRatesGroupThresholdsId: materialBillableItem.customRatesGroupThresholdsId || null,
    globalRatesThresholdsId: materialBillableItem.globalRatesThresholdsId,
    applySurcharges: false,
  } as OrderThresholdInput;
};

export const isMaterialOrderBillableItem = (
  bi: OrderBillableItem | OrderBillableItemInput,
): boolean => bi.type === OrderBillableItemType.MATERIAL;
export const isFeeOrderBillableItem = (bi: OrderBillableItem | OrderBillableItemInput): boolean =>
  bi.type === OrderBillableItemType.FEE;

export const isOrderBillableItemMaterialOrFee = (
  bi: OrderBillableItem | OrderBillableItemInput,
): boolean => isMaterialOrderBillableItem(bi) || isFeeOrderBillableItem(bi);

export const convertOrderBillableItemToInput = (bi: OrderBillableItem): OrderBillableItemInput => {
  const input = pick(bi, [
    'uuid',
    'materialId',
    'billableItemId',
    'readonly',
    'priceSource',
    'priceSourceType',
    'price',
    'type',
    'quantity',
    'globalRatesLineItemsId',
    'customRatesGroupLineItemsId',
    'thresholdId',
    'applySurcharges',
    'globalRatesThresholdsId',
    'customRatesGroupThresholdsId',
    'globalRatesServiceId',
    'customRatesGroupServicesId',
    'auto',
  ]);

  return assign(new OrderBillableItemInput(), input);
};

export const createOrderMaterialAndMiscellaneousDistribution = async (
  ctx: QueryContext,
  order: Order,
): Promise<void> => {
  const CtxOrderMaterialDistribution = getContextualizedEntity(OrderMaterialDistribution)(ctx);
  const CtxOrderMiscellaneousMaterialDistribution = getContextualizedEntity(
    OrderMiscellaneousMaterialDistribution,
  )(ctx);

  const materials = await materialService.get(ctx, {
    activeOnly: true,
  });
  order.materialsDistribution = getOrderMaterialDistribution(
    order,
    materials.data,
    CtxOrderMaterialDistribution,
  );
  order.miscellaneousMaterialsDistribution = getOrderMiscellaneousMaterialDistribution(
    order,
    materials.data,
    CtxOrderMiscellaneousMaterialDistribution,
  );
};

export const updateOrderMaterialAndMiscellaneousDistribution = async (
  ctx: QueryContext,
  order: Order,
  materialsDistributionInput: OrderMaterialDistributionInput[],
  miscellaneousMaterialsDistributionInput: OrderMiscellaneousMaterialDistributionInput[],
): Promise<void> => {
  const CtxOrderMaterialDistribution = getContextualizedEntity(OrderMaterialDistribution)(ctx);
  const CtxOrderMiscellaneousMaterialDistribution = getContextualizedEntity(
    OrderMiscellaneousMaterialDistribution,
  )(ctx);

  if (!isEmpty(materialsDistributionInput)) {
    const materialById = keyBy(materialsDistributionInput, 'materialId');

    order.materialsDistribution = await CtxOrderMaterialDistribution.find({
      where: {
        order,
      },
    });
    const newMaterialDistributions = differenceBy(
      materialsDistributionInput,
      order.materialsDistribution,
      'uuid',
    );

    if (newMaterialDistributions.length) {
      order.materialsDistribution.push(
        ...newMaterialDistributions.map((m) =>
          CtxOrderMaterialDistribution.merge(new CtxOrderMaterialDistribution(), m),
        ),
      );
    }

    order.materialsDistribution = order.materialsDistribution.map((materialDistribution) =>
      CtxOrderMaterialDistribution.merge(materialDistribution, {
        value: materialById[materialDistribution.materialId]?.value || 0,
      }),
    );
  }

  if (!isEmpty(miscellaneousMaterialsDistributionInput)) {
    const miscById = keyBy(miscellaneousMaterialsDistributionInput, 'materialId');

    order.miscellaneousMaterialsDistribution = await CtxOrderMiscellaneousMaterialDistribution.find(
      {
        where: {
          order,
        },
      },
    );

    const newMiscMaterialDistributions = differenceBy(
      miscellaneousMaterialsDistributionInput,
      order.miscellaneousMaterialsDistribution,
      'uuid',
    );

    if (newMiscMaterialDistributions.length) {
      order.miscellaneousMaterialsDistribution.push(
        ...newMiscMaterialDistributions.map((m) =>
          CtxOrderMiscellaneousMaterialDistribution.merge(
            new CtxOrderMiscellaneousMaterialDistribution(),
            m,
          ),
        ),
      );
    }

    order.miscellaneousMaterialsDistribution = order.miscellaneousMaterialsDistribution.map(
      (miscellaneousMaterialDistribution) => {
        return CtxOrderMiscellaneousMaterialDistribution.merge(miscellaneousMaterialDistribution, {
          quantity: miscById[miscellaneousMaterialDistribution.materialId]?.quantity || 0,
        });
      },
    );
  }
};
