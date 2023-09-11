import { Order } from '@root/stores/entities';

export enum MediaType {
  Ticket = 'ticket',
  All = 'all',
}

export interface IMediaSection {
  order: Order;
  mediaType?: MediaType;
}
