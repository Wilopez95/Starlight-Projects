import {
  IEntity,
  IGlobalRateLineItem,
  ILineItem,
  IMaterial,
  ThresholdUnitType,
  VersionedEntity,
} from '@root/core/types';

export type OrderStatusType =
  | 'inProgress'
  | 'completed'
  | 'approved'
  | 'canceled'
  | 'finalized'
  | 'invoiced';

export interface IOrderLineItem extends IEntity {
  billableLineItemId: number;
  quantity: number;
  units: 'each' | ThresholdUnitType;
  globalRatesLineItemsId?: number;
  customRatesGroupLineItemsId?: number;
  price?: number;
  nextPrice?: number;
  materialId?: number | null;
  billableLineItem?: VersionedEntity<ILineItem>;
  globalRatesLineItem?: VersionedEntity<IGlobalRateLineItem>;
  material?: VersionedEntity<IMaterial>;
  effectiveDate?: Date | null;
}
