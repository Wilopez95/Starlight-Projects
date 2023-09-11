import { OrderBillableItem, OrderBillableItemType } from '../../../../../graphql/api';

const BillableItemTypeToFieldName = {
  [OrderBillableItemType.Fee]: 'fees',
  [OrderBillableItemType.Line]: 'lineItems',
  [OrderBillableItemType.Miscellanies]: 'miscellaneousItems',
  [OrderBillableItemType.Material]: 'materials',
};

export const getTaxProperty = (billableItem: OrderBillableItem): string => {
  const prefix = BillableItemTypeToFieldName[billableItem.type];
  const suffix = billableItem.billableItem?.materialBasedPricing ? 'BasedOnMaterials' : 'Taxes';
  const property = prefix + suffix;

  return property;
};
