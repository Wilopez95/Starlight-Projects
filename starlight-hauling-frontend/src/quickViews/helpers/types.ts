import { BillableItemActionEnum } from '@root/consts';

export interface IGetValidationSchema {
  billableItemAction?: BillableItemActionEnum;
  thirdPartyHaulerId?: number | null;
}
