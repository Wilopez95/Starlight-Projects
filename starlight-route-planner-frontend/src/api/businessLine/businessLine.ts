import { BusinessLineFragment } from '@root/graphql';
import { IBusinessLine } from '@root/types';

import { BaseGraphqlService } from '../base';

export class BusinessLineService extends BaseGraphqlService {
  getHaulingBusinessLines() {
    return this.graphql<{ haulingBusinessLines: IBusinessLine[] }>(
      `
        query HaulingBusinessLines {
          haulingBusinessLines {
            ${BusinessLineFragment}
          }
        }
      `,
    );
  }
}
