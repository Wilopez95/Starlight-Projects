import { BillableItemActionEnum, BillableLineItemUnitTypeEnum } from '@root/consts';
import { IBillableService } from '@root/types';

export const getBillableServiceMock = (): IBillableService => ({
  id: 1,
  createdAt: new Date('December 1, 2021 00:00:00'),
  updatedAt: new Date('December 2, 2021 00:00:00'),
  businessLineId: '1',
  active: true,
  unit: BillableLineItemUnitTypeEnum.NONE,
  description: '',
  action: BillableItemActionEnum.delivery,
  importCodes: '',
  equipmentItemId: 1,
  materialBasedPricing: true,
  allowForRecurringOrders: true,
  oneTime: false,
  applySurcharges: false,
  spUsed: false,
});
