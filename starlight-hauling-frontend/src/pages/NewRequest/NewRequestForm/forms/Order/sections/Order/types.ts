export interface IGenerateOrderPropPathInput {
  orderIndex: number;
  property: string;
}

export interface IGenerateLineItemPropPathInput extends IGenerateOrderPropPathInput {
  lineItemIndex: number;
}

export interface IOrderSection {
  serviceAreaId?: number;
}
