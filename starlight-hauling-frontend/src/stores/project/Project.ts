import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IProject, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ProjectStore } from './ProjectStore';

export class Project extends BaseEntity implements IProject {
  customerJobSiteId: number;
  generatedId: string;
  description: string;
  poRequired: boolean;
  permitRequired: boolean;
  store: ProjectStore;
  startDate: Date | null;
  endDate: Date | null;

  constructor(store: ProjectStore, entity: JsonConversions<IProject>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.customerJobSiteId = entity.customerJobSiteId;
    this.generatedId = entity.generatedId;
    this.description = entity.description;
    this.poRequired = entity.poRequired;
    this.permitRequired = entity.permitRequired;

    this.startDate = entity.startDate ? substituteLocalTimeZoneInsteadUTC(entity.startDate) : null;
    this.endDate = entity.endDate ? substituteLocalTimeZoneInsteadUTC(entity.endDate) : null;
  }
}
