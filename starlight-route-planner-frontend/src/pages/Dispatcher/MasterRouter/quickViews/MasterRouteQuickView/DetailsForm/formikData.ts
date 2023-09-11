import { TFunction } from 'i18next';
import { array, number, object, string } from 'yup';

const I18N_PATH = 'quickViews.MasterRouteView.Validation.';

const serviceDaysValidation = (t: TFunction) =>
  array()
    .of(number())
    .min(1, t(`${I18N_PATH}ServiceDays`));

export const DetailsValidationSchema = (t: TFunction, isEdited = false) =>
  object({
    ...(!isEdited && { serviceDaysList: serviceDaysValidation(t) }),
    ...(!isEdited && { color: string().required() }),
    name: string()
      .max(30, t(`${I18N_PATH}RouteNameLengthAndUniqueness`))
      .required(t(`${I18N_PATH}RouteNameRequired`)),
    truckId: string().nullable(),
    driverId: number().nullable(),
  });
