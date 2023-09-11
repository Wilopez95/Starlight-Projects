import { FileWithPreview, IMedia } from '@root/types';
import { IWeightTicketFormValues } from '@root/widgets/modals/WeightTicketFormModal/WeightTicketForm/types';

export interface IWeightTicketRequestParams
  extends Omit<
    IWeightTicketFormValues,
    'arrivalTime' | 'departureTime' | 'media' | 'timeOnLandfill'
  > {
  media: IMedia | FileWithPreview;
  arrivalTime?: string;
  departureTime?: string;
  timeOnLandfill?: string;
}
