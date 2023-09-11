import { haulingHttpClient } from '@root/core/api/base';

import { ResourceLogin } from './types';

export class LobbyService {
  readonly baseUrl: string = 'lobby';

  getAvailableResourceLogins() {
    return haulingHttpClient.get<any, ResourceLogin[]>(`${this.baseUrl}/available-resource-logins`);
  }
}
