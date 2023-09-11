import { TextInputElement } from '@starlightpro/shared-components';

import { BillableItemActionEnum, BusinessLineType } from '@root/consts';

export interface IWorkOrderDataProps {
  onChangeWeight(e: React.ChangeEvent<TextInputElement>): void;
  onChangeStartService(name: string, value: Date): void;
}

export type GetWorkOrderDataComponentOptions = {
  businessLineType: BusinessLineType;
  billableItemAction?: BillableItemActionEnum;
  thirdPartyHaulerId?: number;
};
