import { IWeightTicket } from '@root/types';

export interface ITabProps {
  direction: 'left' | 'right';
  weightTicket: IWeightTicket;
  currentMediaFile?: {
    src: string;
    fileName: string;
    category: string;
    author?: string;
    timestamp?: Date;
  };
}
