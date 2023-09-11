import { defaultTo } from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';

import Order, { OrderType } from '../../../entities/Order';
import {
  OrderBillableItem,
  OrderBillableItemInput,
  OrderBillableItemType,
} from '../../../entities/OrderBillableItem';
import { NO_PRICE } from './orderBillableItemPrice';
import { QueryContext } from '../../../../../types/QueryContext';
import { HaulingBillableItem, HaulingBillableItemType } from '../../../entities/BillableItem';
import getContextualizedEntity from '../../../../../utils/getContextualizedEntity';
import { OrderMiscellaneousMaterialDistribution } from '../../../entities/OrderMiscellaneousMaterialDistribution';
import { getHaulingBillableItems } from '../BillableItemResolver';
import { keyBy, keys } from 'lodash';

interface CreateOrderBillableItemsForDisposalMaterialsOptions {
  order: Order;
  ContextualizedOrderBillableItem: typeof OrderBillableItem;
}

const createOrderBillableItemsForDisposalMaterials = ({
  order: { materialId, type, weightIn, weightOut, id },
  ContextualizedOrderBillableItem,
}: CreateOrderBillableItemsForDisposalMaterialsOptions): OrderBillableItem[] => {
  if (!materialId) {
    return [];
  }

  return [
    ContextualizedOrderBillableItem.create({
      uuid: uuidv4(),
      materialId,
      quantity: calculateDisposalMaterialQuantity(type, weightIn, weightOut),
      type: OrderBillableItemType.MATERIAL,
      readonly: false,
      orderId: id,
      auto: false,
      ...NO_PRICE,
    }),
    ContextualizedOrderBillableItem.create({
      uuid: uuidv4(),
      materialId,
      quantity: 1,
      type: OrderBillableItemType.FEE,
      readonly: false,
      orderId: id,
      auto: false,
      ...NO_PRICE,
    }),
  ];
};

export const calculateDisposalMaterialQuantity = (
  type: OrderType,
  weightIn?: number,
  weightOut?: number,
): number => {
  if (type === OrderType.DUMP) {
    return defaultTo(0, weightIn) - defaultTo(0, weightOut);
  }

  if (type === OrderType.LOAD) {
    return defaultTo(0, weightOut) - defaultTo(0, weightIn);
  }

  return 0;
};

export const BillableItemTypeToOrderBillableItemType = {
  [HaulingBillableItemType.MISCELLANIES]: OrderBillableItemType.MISCELLANIES,
  [HaulingBillableItemType.LINE]: OrderBillableItemType.LINE,
};

const selectMaterialForBillableItem = (
  bi: HaulingBillableItem,
  orderMaterialId: number | null = null,
): number | null => {
  if (!bi.materialBasedPricing) {
    return null;
  }

  if (bi.type === HaulingBillableItemType.LINE) {
    return orderMaterialId;
  }

  if (bi.type === HaulingBillableItemType.MISCELLANIES) {
    return bi.materialIds?.[0] ?? null;
  }

  return null;
};

/**
 * create OrderBillableItems out of billableItems
 */
export const createOrderBillableItems = (
  billableItems: HaulingBillableItem[],
  materialId: number | null = null,
): OrderBillableItemInput[] => {
  return billableItems.map((billableItem) => {
    return {
      uuid: uuidv4(),
      billableItemId: billableItem.id,
      materialId: selectMaterialForBillableItem(billableItem, materialId),
      quantity: 1,
      type: BillableItemTypeToOrderBillableItemType[billableItem.type],
      readonly: false,
      auto: false,
      ...NO_PRICE,
    };
  });
};

interface CreateInitialOrderBillableItems {
  orderId: number;
  order?: Order;
}

/**
 * create initial OrderBillablItems for an order
 */
export const createInitialOrderBillableItems = async (
  ctx: QueryContext,
  { orderId, order: fetchedOrder }: CreateInitialOrderBillableItems,
): Promise<OrderBillableItem[]> => {
  const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
  const ContextualizedOrderBillableItem = getContextualizedEntity(OrderBillableItem)(ctx);
  const order =
    fetchedOrder ||
    (await ContextualizedOrder.findOneOrFail({
      id: orderId,
    }));

  const disposalMaterials = createOrderBillableItemsForDisposalMaterials({
    order,
    ContextualizedOrderBillableItem,
  });

  return [...disposalMaterials];
};

export const createAutoMiscOrderBillableItems = async (
  ctx: QueryContext,
  miscMaterials: OrderMiscellaneousMaterialDistribution[],
): Promise<OrderBillableItem[]> => {
  const billableItems = await getHaulingBillableItems(ctx, {
    active: true,
    types: [HaulingBillableItemType.MISCELLANIES],
  });
  const ContextualizedOrderBillableItem = getContextualizedEntity(OrderBillableItem)(ctx);
  const materialsDistributionMap = keyBy(miscMaterials, 'materialId');
  const distributionMaterialIds = keys(materialsDistributionMap);
  const result = [];

  for (const hbi of billableItems) {
    if (!hbi.materialBasedPricing) {
      continue;
    }
    for (const materialId of distributionMaterialIds) {
      if (hbi.materialIds?.includes(Number(materialId))) {
        const quantity = Number(materialsDistributionMap[materialId].quantity);

        if (quantity > 0) {
          const [autoOrderBillableItem] = createOrderBillableItems([hbi]);
          result.push(
            ContextualizedOrderBillableItem.merge(new ContextualizedOrderBillableItem(), {
              ...autoOrderBillableItem,
              materialId: Number(materialId) || undefined,
              auto: true,
              quantity,
            }),
          );
        }
      }
    }
  }

  return result;
};
