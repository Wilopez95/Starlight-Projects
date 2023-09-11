import { IWeightTicketRequestParams } from '@root/stores/WeightTicketStore/types';

import { IWeightTicketFormValues } from './types';

export const getNormalizedData = (
  values: IWeightTicketFormValues,
  isEdit: boolean,
): IWeightTicketRequestParams => {
  const normalized = {
    ...values,
    arrivalTime: values.arrivalTime ? new Date(values.arrivalTime).toUTCString() : undefined,
    departureTime: values.departureTime ? new Date(values.departureTime).toUTCString() : undefined,
    timeOnLandfill: values.timeOnLandfill
      ? new Date(values.timeOnLandfill).toUTCString()
      : undefined,
    media: values.media[0],
  };

  if (!isEdit) {
    normalized.temporaryId = Date.now();
  }

  return normalized;
};
