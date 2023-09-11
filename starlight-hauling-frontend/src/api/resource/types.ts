import { IResource } from '@root/types';

export type ResourceResponse = Omit<IResource, 'label'>;

export interface ResourcesResponse {
  resources: { data: ResourceResponse[]; total: number };
}
