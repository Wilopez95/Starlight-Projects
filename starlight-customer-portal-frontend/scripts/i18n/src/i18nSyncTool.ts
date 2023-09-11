import { II18nSyncAdapter } from './types';

export class I18nSyncTool<D, U> {
  constructor(private client: II18nSyncAdapter<D, U>) {
    this.client = client;
  }

  pull() {
    return this.client.download();
  }

  push() {
    return this.client.upload();
  }
}
