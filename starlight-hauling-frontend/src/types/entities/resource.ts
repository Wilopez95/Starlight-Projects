import { ResourceType } from '../enums';

export interface IResource {
  srn: string;
  type: ResourceType;
  label?: string;
}
