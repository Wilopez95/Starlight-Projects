import { BillableItemActionEnum, BusinessLineType } from '@root/consts';

export interface IWorkOrderDataProps {
  oneTime: boolean;
  action?: BillableItemActionEnum;
  businessLineType?: BusinessLineType;
}
