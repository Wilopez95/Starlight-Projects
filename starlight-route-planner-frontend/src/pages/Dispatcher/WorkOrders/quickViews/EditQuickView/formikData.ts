import { TFunction } from 'i18next';
import { date, object, string } from 'yup';

import { type FormMediaDataType } from '@root/hooks/useMedia';
import { FileWithPreview, IMedia, IWorkOrder } from '@root/types';
import { parseISO } from 'date-fns';

export const getInitialValues = (workOrder: IWorkOrder) => ({
  assignedRoute: workOrder.assignedRoute,
  serviceDate: parseISO(workOrder.serviceDate),
  status: workOrder.status,
  pickedUpEquipment: workOrder.pickedUpEquipment,
  droppedEquipment: workOrder.droppedEquipment,
  weight: workOrder.weight,
  cancellationReason: workOrder.cancellationReason,
  cancellationComment: workOrder.cancellationComment,
  media: (workOrder.media ?? []) as (IMedia | FileWithPreview)[],
});

export type FormDataType = ReturnType<typeof getInitialValues> & FormMediaDataType;

const I18N_PATH = 'quickViews.WorkOrderEdit.Validation.';

export const validationSchema = (t: TFunction) =>
  object({
    serviceDate: date().required(t(`${I18N_PATH}ServiceDate`)),
    status: string().required(t(`${I18N_PATH}Status`)),
  });
