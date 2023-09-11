import { BaseGraphqlService } from '../base';

import { ResourceResponse, ResourcesResponse } from './types';

export class ResourceService extends BaseGraphqlService {
  constructor() {
    super('ums');
  }

  getResources(): Promise<ResourceResponse[]> {
    return this.getAllResources(0, 10000);
  }

  private async getAllResources(offset = 0, limit = 25): Promise<ResourceResponse[]> {
    const {
      resources: { data },
    } = await this.graphql<ResourcesResponse>(
      `
      query GetResources($offset: Int = 0, $limit: Int = 25) {
        resources(offset: $offset, limit: $limit, filter: { configurableOnly: true }) {
          data {
            srn
            type
          }
          total
        }
      }
      `,
      { offset, limit },
    );

    return data;
  }
}
