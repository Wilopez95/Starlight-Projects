import { OffsetUnit } from '@starlightpro/shared-components';
import { FileWithPreview, IMedia, WEIGHT_UNIT_ENUM } from '@root/types';

export type StyleProps = {
  columnWidth: string;
  columnsTemplate: string;
  gap: OffsetUnit;
};

export interface IWeightTicketSection {
  styleProps: StyleProps;
  isEdit?: boolean;
}

export interface IWeightTicketFormValues {
  ticketNumber: string;
  loadValue: number;
  weightUnit: WEIGHT_UNIT_ENUM;
  media: (IMedia | FileWithPreview)[];
  materialId?: number;
  id?: number;
  temporaryId?: number;
  disposalSiteId?: number;
  arrivalTime?: Date;
  departureTime?: Date;
  timeOnLandfill?: Date;
}
