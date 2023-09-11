import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { LobbyService } from '../../api';
import { ResourceLogin } from '../../api/lobby/types';

export class LobbyStore {
  @observable loading = false;
  @observable resourceLogins: ResourceLogin[] = [];

  private readonly service: LobbyService;

  constructor() {
    this.service = new LobbyService();
  }

  @actionAsync
  async requestActiveResourceLogins() {
    this.loading = true;

    try {
      this.resourceLogins = await task(this.service.getAvailableResourceLogins());
    } catch (error) {
      console.error('Login Targets Request Error:', error);
    }

    this.loading = false;

    return this.resourceLogins;
  }
}
