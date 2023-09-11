import { WeightTicketFragment } from '@root/graphql';
import { IMedia, IWeightTicket } from '@root/types';

import { BaseGraphqlService } from '../base';

import { ICreateWeightTicketParams, IUpdateWeightTicketParams } from './types';

export class WeightTicketService extends BaseGraphqlService {
  createWeightTicket(params: ICreateWeightTicketParams) {
    const { media, ...input } = params;

    return this.graphql<
      { attachWeightTicket: IWeightTicket },
      {
        input: Omit<ICreateWeightTicketParams, 'media'>;
        media?: File | IMedia;
      }
    >(
      `
      mutation CreateWeightTicket($input: CreateWeightTicketInput!, $media: Upload) {
        createWeightTicket(
          input: $input,
          media: $media
        ) {
          ${WeightTicketFragment}
        }
      }
    `,
      {
        media,
        input,
      },
    );
  }

  updateWeightTicket(id: number, params: IUpdateWeightTicketParams) {
    const { media, ...input } = params;

    return this.graphql<
      { updateWeightTicket: IWeightTicket },
      {
        id: number;
        input: Omit<IUpdateWeightTicketParams, 'media'>;
        media?: File | IMedia;
      }
    >(
      `
      mutation UpdateWeightTicket($id: Int!, $input: UpdateWeightTicketInput!, $media: Upload) {
        updateWeightTicket(
          id: $id,
          input: $input,
          media: $media,
        ) {
          ${WeightTicketFragment}
        }
      }
    `,
      {
        id,
        media,
        input,
      },
    );
  }

  deleteWeightTicket(id: number) {
    return this.graphql<
      { deleteWeightTicket: number },
      {
        id: number;
      }
    >(
      `
      mutation DeleteWeightTicket($id: Int!) {
        deleteWeightTicket(
          id: $id
        )
      }
    `,
      {
        id,
      },
    );
  }
}
