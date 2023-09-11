import { TFunction } from 'i18next';
import { object, string } from 'yup';

const I18N_PATH = 'quickViews.DailyRouteForm.DetailsTab.Validation.';

export const detailsValidationSchema = (t: TFunction) =>
  object({
    name: string()
      .max(30, t(`${I18N_PATH}RouteNameLengthAndUniqueness`))
      .required(t(`${I18N_PATH}RouteNameRequired`)),
    truckId: string().required(t(`${I18N_PATH}TruckId`)),
    driverId: string().required(t(`${I18N_PATH}DriverId`)),
  });
