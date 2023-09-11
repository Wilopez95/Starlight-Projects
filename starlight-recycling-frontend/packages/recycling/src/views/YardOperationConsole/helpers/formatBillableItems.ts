import {
  HaulingBillableItem,
  HaulingMaterial,
  Maybe,
  OrderBillableItem,
  OrderBillableItemInput,
  OrderBillableItemType,
} from '../../../graphql/api';
import { toNumber } from 'lodash-es';
import { map, pipe, propEq, reject } from 'lodash/fp';

export interface BillableItemForFormat
  extends Pick<
    OrderBillableItem,
    | 'priceSource'
    | 'priceSourceType'
    | 'uuid'
    | 'type'
    | 'quantity'
    | 'price'
    | 'globalRatesLineItemsId'
    | 'customRatesGroupLineItemsId'
    | 'auto'
    | 'globalRatesThresholdsId'
    | 'customRatesGroupThresholdsId'
    | 'globalRatesServiceId'
    | 'customRatesGroupServicesId'
    | 'thresholdId'
  > {
  billableItem?: Maybe<Pick<HaulingBillableItem, 'id'>>;
  material?: Maybe<Pick<HaulingMaterial, 'id'>>;
}

export const formatBillableItemsToSubmit = (
  billableItems: BillableItemForFormat[],
): OrderBillableItemInput[] =>
  pipe(
    reject<BillableItemForFormat>(propEq('quantity', 0)),
    map<BillableItemForFormat, OrderBillableItemInput>((value) => ({
      priceSource: value.priceSource,
      priceSourceType: value.priceSourceType,
      uuid: value.uuid,
      type: value.type,
      billableItemId: value.billableItem?.id,
      materialId: value.material?.id,
      quantity: toNumber(value.quantity || 0),
      price: toNumber(value.price || 0),
      globalRatesLineItemsId: value.globalRatesLineItemsId,
      customRatesGroupLineItemsId: value.customRatesGroupLineItemsId,
      auto: value.auto,
      globalRatesServiceId: value.globalRatesServiceId,
      customRatesGroupServicesId: value.customRatesGroupServicesId,
      globalRatesThresholdsId: value.globalRatesThresholdsId,
      customRatesGroupThresholdsId: value.customRatesGroupThresholdsId,
      thresholdId: value.thresholdId,
    })),
  )(billableItems);

export const isMaterialOrderBillableItem = (bi: OrderBillableItem | OrderBillableItemInput) =>
  bi.type === OrderBillableItemType.Material;
export const isFeeOrderBillableItem = (bi: OrderBillableItem | OrderBillableItemInput) =>
  bi.type === OrderBillableItemType.Fee;

export const isOrderBillableItemMaterialOrFee = (
  bi: OrderBillableItem | OrderBillableItemInput,
): boolean => isMaterialOrderBillableItem(bi) || isFeeOrderBillableItem(bi);
