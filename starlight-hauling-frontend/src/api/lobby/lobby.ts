import { haulingHttpClient } from '../base/httpClient';

import { ResourceLogin } from './types';

export class LobbyService {
  readonly baseUrl: string = 'lobby';

  getAvailableResourceLogins() {
    return haulingHttpClient.get<ResourceLogin[], ResourceLogin[]>(
      `${this.baseUrl}/available-resource-logins`,
    );
  }
}
