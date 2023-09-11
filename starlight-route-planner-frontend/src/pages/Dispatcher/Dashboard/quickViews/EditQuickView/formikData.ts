import { TFunction } from 'i18next';
import { array, number, object, string } from 'yup';

import { DailyRouteStatus } from '@root/consts';
import { IWeightTicketRequestParams } from '@root/stores/WeightTicketStore/types';
import { IDashboardDailyRoute } from '@root/types';

export const getInitialValues = (
  dailyRoute: IDashboardDailyRoute,
  initialStatus?: DailyRouteStatus,
) => ({
  name: dailyRoute.name as string,
  status: initialStatus,
  driverId: dailyRoute.driverId,
  clockIn: dailyRoute.clockIn ? new Date(+dailyRoute.clockIn) : undefined,
  clockOut: dailyRoute.clockOut ? new Date(+dailyRoute.clockOut) : undefined,
  truckId: dailyRoute.truckId,
  odometerStart: dailyRoute.odometerStart,
  odometerEnd: dailyRoute.odometerEnd,
  weightTickets: dailyRoute.weightTickets ?? [],
  weightTicketsToCreate: [] as IWeightTicketRequestParams[],
  weightTicketsToEdit: [] as IWeightTicketRequestParams[],
  weightTicketIdsToDelete: [] as number[],
  weightTicketConflicts: [] as number[],
});

export type FormDataType = Required<ReturnType<typeof getInitialValues>>;

const I18N_PATH = 'quickViews.DailyRouteForm.DetailsTab.Validation.';

export const validationSchema = (t: TFunction) =>
  object({
    name: string()
      .max(30, t(`${I18N_PATH}RouteNameLengthAndUniqueness`))
      .required(t(`${I18N_PATH}RouteNameRequired`)),
    truckId: string().required(t(`${I18N_PATH}TruckId`)),
    driverId: string().required(t(`${I18N_PATH}DriverId`)),
    weightTicketConflicts: array().of(number()).max(0),
  });
