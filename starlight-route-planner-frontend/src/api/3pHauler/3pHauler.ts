import { HaulerFragment } from '@root/graphql';
import { type I3pHauler } from '@root/types';

import { BaseGraphqlService } from '../base';

export class HaulerService extends BaseGraphqlService {
  getHaulerItems() {
    return this.graphql<{ hauling3rdPartyHaulers: I3pHauler[] }, void>(
      `
        query Hauling3rdPartyHaulers {
          hauling3rdPartyHaulers {
            ${HaulerFragment}
          }
        }
      `,
    );
  }
}
