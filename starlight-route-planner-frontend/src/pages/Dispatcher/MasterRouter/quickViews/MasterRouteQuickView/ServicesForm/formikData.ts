import { TFunction } from 'i18next';
import { array, object } from 'yup';

const I18N_PATH = 'quickViews.MasterRouteView.Validation.';

export const ServicesValidationSchema = (t: TFunction) =>
  object({
    serviceItems: array().min(1, t(`${I18N_PATH}ServiceItems`)),
  });
