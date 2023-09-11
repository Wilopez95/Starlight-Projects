import { IProject } from '@root/types';

export interface ILinkedProjects {
  onProjectSelect(project: IProject): void;
}
