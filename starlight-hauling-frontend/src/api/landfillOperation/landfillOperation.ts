import { ILandfillOperation, IStoreCount } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import { ILandfillSyncRequest } from './types';

export class LandfillOperationService extends BaseService<
  ILandfillOperation,
  ILandfillOperation,
  IStoreCount
> {
  constructor() {
    super('landfill-operations');
  }

  sync(options: ILandfillSyncRequest) {
    return haulingHttpClient.post<ILandfillSyncRequest, ILandfillOperation>(
      `${this.baseUrl}/sync`,
      options,
    );
  }

  edit(id: number, values: ILandfillOperation) {
    return haulingHttpClient.put({
      url: `${this.baseUrl}/${id}`,
      data: values,
    });
  }
}
