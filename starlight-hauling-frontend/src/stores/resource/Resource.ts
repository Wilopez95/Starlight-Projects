import { snakeCase } from 'lodash-es';

import { IResource, ResourceType } from '@root/types';

const SRN_REGEXP =
  /^srn:((?<tenant>[\d-_\w*]+)|global):(?<type>[\w*-_]+):(?<subResource>[\d-_\w*]+)$/;

export class Resource implements IResource {
  srn: string;
  type: ResourceType;
  label?: string;

  constructor(entity: IResource) {
    this.srn = entity.srn;
    this.type = entity.type;
    this.label = entity.label;
  }

  static parseSrn(srn: string): [ResourceType, string, string] {
    const match = SRN_REGEXP.exec(srn);

    if (!match?.groups) {
      throw new TypeError(`Invalid SRN ${srn}`);
    }

    const type = snakeCase(match.groups.type).toUpperCase() as ResourceType;

    return [type, match.groups.tenant, match.groups.subResource];
  }
}
