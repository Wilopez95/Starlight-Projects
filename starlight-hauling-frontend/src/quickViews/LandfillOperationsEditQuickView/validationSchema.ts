import { endOfDay, isAfter, isBefore, set, startOfDay } from 'date-fns';
import i18next from 'i18next';
import * as Yup from 'yup';

const I18N_PATH = 'components.forms.LandfillOperationEdit.ValidationErrors.';

export const defaultValidationSchema = Yup.object().shape({
  materialsTotal: Yup.number().equals([100], i18next.t(`${I18N_PATH}MaterialsTotal`)),
  mappedMaterialId: Yup.number().nullable(),
  truck: Yup.string().required(i18next.t(`${I18N_PATH}TruckRequired`)),
  origin: Yup.string(),
  purchaseOrder: Yup.string(),

  arrivalDate: Yup.date()
    .required(i18next.t(`${I18N_PATH}ArrivalDateRequired`))
    .test('arrivalDate', 'Must be before than Departure Date', function (arrivalDate) {
      const departureDate: Date | undefined | null = this.parent.departureDate;

      if (!arrivalDate || !departureDate) {
        return false;
      }

      return isBefore(arrivalDate, endOfDay(departureDate));
    }),
  timeIn: Yup.date()
    .required(i18next.t(`${I18N_PATH}ArrivalTimeRequired`))
    .test('timeIn', 'Must be before than Departure Time', function (timeIn) {
      const arrivalDate: Date | undefined = this.parent.arrivalDate;
      const departureDate: Date | undefined = this.parent.departureDate;
      const timeOut: Date | undefined = this.parent.timeOut;

      if (!timeIn || !arrivalDate || !departureDate || !timeOut) {
        return false;
      }

      const fullArrivalDate = set(arrivalDate, {
        hours: timeIn.getHours(),
        minutes: timeIn.getMinutes(),
        seconds: timeIn.getSeconds(),
        milliseconds: 0,
      });

      const fullDepartureDate = set(departureDate, {
        hours: timeOut.getHours(),
        minutes: timeOut.getMinutes(),
        seconds: timeOut.getSeconds(),
        milliseconds: 0,
      });

      return isBefore(fullArrivalDate, fullDepartureDate);
    }),
  departureDate: Yup.date()
    .required(i18next.t(`${I18N_PATH}DepartureDateRequired`))
    .test('departureDate', 'Must be after than Arrival Date', function (departureDate) {
      const arrivalDate: Date | undefined | null = this.parent.arrivalDate;

      if (!departureDate || !arrivalDate) {
        return false;
      }

      return isAfter(departureDate, startOfDay(arrivalDate));
    }),
  timeOut: Yup.date()
    .required(i18next.t(`${I18N_PATH}ArrivalTimeRequired`))
    .test('timeOut', 'Must be after than Arrival Time', function (timeOut) {
      const arrivalDate: Date | undefined = this.parent.arrivalDate;
      const departureDate: Date | undefined = this.parent.departureDate;
      const timeIn: Date | undefined = this.parent.timeIn;

      if (!timeIn || !arrivalDate || !departureDate || !timeOut) {
        return false;
      }

      const fullArrivalDate = set(arrivalDate, {
        hours: timeIn.getHours(),
        minutes: timeIn.getMinutes(),
        seconds: timeIn.getSeconds(),
        milliseconds: 0,
      });

      const fullDepartureDate = set(departureDate, {
        hours: timeOut.getHours(),
        minutes: timeOut.getMinutes(),
        seconds: timeOut.getSeconds(),
        milliseconds: 0,
      });

      return isAfter(fullDepartureDate, fullArrivalDate);
    }),
  truckTare: Yup.number()
    .nullable()
    .when('departureUseTare', {
      is: true,
      then: Yup.number()
        .typeError(i18next.t(`${I18N_PATH}TrackTareNumber`))
        .required(i18next.t(`${I18N_PATH}TrackTareRequired`)),
    }),
  canTare: Yup.number()
    .nullable()
    .when('departureUseTare', {
      is: true,
      then: Yup.number()
        .typeError(i18next.t(`${I18N_PATH}CanTareNumber`))
        .required(i18next.t(`${I18N_PATH}CanTareRequired`)),
    }),
  weightIn: Yup.number()
    .positive(i18next.t(`${I18N_PATH}WeightInPositive`))
    .required(i18next.t(`${I18N_PATH}WeightInRequired`)),
  weightOut: Yup.number()
    .positive(i18next.t(`${I18N_PATH}WeightOutPositive`))
    .required(i18next.t(`${I18N_PATH}WeightOutRequired`)),
  ticketNumber: Yup.string().required(i18next.t(`${I18N_PATH}TicketRequired`)),

  materials: Yup.array().of(
    Yup.object().shape({
      value: Yup.number().integer().moreThan(-1),
    }),
  ),
  miscellaneousItems: Yup.array().of(
    Yup.object().shape({
      quantity: Yup.number().integer().moreThan(-1).required(),
    }),
  ),
});
