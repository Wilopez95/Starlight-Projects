import { type TFunction } from 'i18next';
import { date, mixed, number, object, string } from 'yup';
import { type FormMediaDataType } from '@root/hooks/useMedia';
import { type IWeightTicket, WEIGHT_UNIT_ENUM } from '@root/types';
import { type IWeightTicketFormValues } from './types';

const I18N_PATH = 'components.modals.WeightTicket.Validation.';

export const today = new Date();

export const generateWeightTicketValidationSchema = (
  t: TFunction,
  weightTicketNumberList: string[],
) =>
  object().shape({
    ticketNumber: string()
      .required(t(`${I18N_PATH}Required`))
      .test('ticketNumber', t(`${I18N_PATH}TicketNumberMustBeUnique`), (value?: string | null) => {
        return !!value && !weightTicketNumberList.includes(value);
      }),
    disposalSiteId: number().nullable(),
    media: mixed().test(
      'file',
      t(`${I18N_PATH}MediaIsRequired`),
      value => !!(value?.length && value[0]),
    ),
    arrivalTime: date().nullable(),
    departureTime: date().nullable(),
    timeOnLandfill: date().nullable(),
    loadValue: number()
      .required(t(`${I18N_PATH}LoadValueIsRequired`))
      .positive(t(`${I18N_PATH}LoadValueMustBePositive`)),
    weightUnit: string().required(t(`${I18N_PATH}PleaseSpecifyUnitsType`)),
    materialId: number().nullable(),
  });

export const getInitialValues = (
  currentDate: Date,
  weightTicket?: IWeightTicket,
): IWeightTicketFormValues => {
  if (!weightTicket) {
    return {
      temporaryId: undefined,
      ticketNumber: '',
      loadValue: 0,
      weightUnit: '' as WEIGHT_UNIT_ENUM,
      materialId: undefined,
      disposalSiteId: undefined,
      arrivalTime: currentDate,
      departureTime: currentDate,
      timeOnLandfill: undefined,
      media: [],
    };
  }

  return {
    id: weightTicket.id,
    ticketNumber: weightTicket.ticketNumber,
    disposalSiteId: weightTicket.disposalSiteId,
    arrivalTime: weightTicket.arrivalTime ? new Date(weightTicket.arrivalTime) : currentDate,
    departureTime: weightTicket.departureTime ? new Date(weightTicket.departureTime) : currentDate,
    timeOnLandfill: weightTicket.timeOnLandfill ? new Date(weightTicket.timeOnLandfill) : undefined,
    loadValue: weightTicket.loadValue,
    weightUnit: weightTicket.weightUnit,
    materialId: weightTicket.materialId,
    media: [weightTicket.media],
  };
};

export type FormDataType = ReturnType<typeof getInitialValues> & FormMediaDataType;
