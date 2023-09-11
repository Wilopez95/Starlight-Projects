import { TFunction } from 'i18next';
import { array, object } from 'yup';

const I18N_PATH = 'quickViews.DailyRouteForm.WorkOrdersTab.Validation.';

export const workOrdersValidationSchema = (t: TFunction) =>
  object({
    workOrders: array().min(1, t(`${I18N_PATH}WorkOrders`)),
  });
