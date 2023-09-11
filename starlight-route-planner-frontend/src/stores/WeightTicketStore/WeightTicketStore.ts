import { actionAsync, task } from 'mobx-utils';

import { WeightTicketService } from '@root/api';
import { IWeightTicket } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { IWeightTicketRequestParams } from './types';

export class WeightTicketStore extends BaseStore<IWeightTicket> {
  private readonly service: WeightTicketService;
  media?: File;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new WeightTicketService();
  }

  @actionAsync
  async createWeightTicket(dailyRouteId: number, input: IWeightTicketRequestParams) {
    const { temporaryId, ...params } = input;

    try {
      return await task(
        this.service.createWeightTicket({
          dailyRouteId,
          ...params,
        }),
      );
    } catch (error) {
      console.error('Error while creating weight ticket', error);

      return {
        id: temporaryId,
        error,
      };
    }
  }

  @actionAsync
  async updateWeightTicket(input: IWeightTicketRequestParams) {
    const { id, ...params } = input;

    try {
      if (id) {
        return await task(this.service.updateWeightTicket(id, params));
      } else {
        console.error('Error while editing weight ticket, No ID provided');
      }
    } catch (error) {
      console.error('Error while editing weight ticket', error);

      return {
        id,
        error,
      };
    }
  }

  @actionAsync
  async deleteWeightTicket(id: number) {
    try {
      return await this.service.deleteWeightTicket(id);
    } catch (err) {
      console.error('Error while deleting weight ticket', err);
    }
  }
}
