import { TFunction } from 'i18next';
import { object, string } from 'yup';

import { IWorkOrdersBulkStatusChange } from '@root/api';
import { WorkOrderStatus } from '@root/consts/workOrder';

const I18N_PATH = 'components.modals.WorkOrderUpdateStatus.Validation.';

export const defaultValues: Omit<IWorkOrdersBulkStatusChange, 'ids'> = {
  status: WorkOrderStatus.APPROVED,
  cancellationReason: undefined,
  cancellationComment: undefined,
};

export const validationSchema = (t: TFunction) =>
  object().shape({
    status: string().required(t(`${I18N_PATH}Status`)),
    cancellationReason: string().when('status', {
      is: (status: string) => status === WorkOrderStatus.CANCELED,
      then: string().required(t(`${I18N_PATH}Reason`)),
      otherwise: string().optional(),
    }),
    cancellationComment: string().when('cancellationReason', {
      is: 'Other',
      then: string().required(t(`${I18N_PATH}Comment`)),
    }),
  });
