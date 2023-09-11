import { find } from 'lodash-es';

import { BillableItemService } from '@root/api';
import { IBillableService, IEquipmentItem } from '@root/types';

import { convertDates } from '../convertDates';

export const billableServiceToSelectOption = (
  billableService: IBillableService,
  equipmentItem?: IEquipmentItem | null,
) => ({
  label: billableService.description,
  value: billableService.id,
  hint: equipmentItem?.shortDescription,
  COEHint: equipmentItem?.customerOwned,
});

export const getBillableServiceForOptions = async ({
  billableItemService,
  businessLineId,
  billableItemId,
}: {
  billableItemService: BillableItemService;
  businessLineId: string | number;
  billableItemId?: number;
}) => {
  if (billableItemService) {
    const billableServices = await billableItemService.get({
      businessLineId,
      activeOnly: true,
    });

    const billableServiceEntities = billableServices.map(convertDates);

    const selectedActiveBillableService = find(billableServiceEntities, {
      id: billableItemId,
    });

    if (!selectedActiveBillableService && billableItemId) {
      const selectedInactiveBillableService = await billableItemService.getById(billableItemId);

      if (selectedInactiveBillableService) {
        billableServices?.push(selectedInactiveBillableService);
      }
    }

    return (
      billableServices
        .filter(service => service.allowForRecurringOrders)
        .map(billableService => billableServiceToSelectOption(convertDates(billableService))) ?? []
    );
  }
};
