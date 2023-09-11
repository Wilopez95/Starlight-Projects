import { IProject } from '@root/types';

export interface IProjectFilterItem {
  title?: string;
  project?: IProject;
  selected?: boolean;
  onClick(project: IProject): void;
  onConfigClick?(project: IProject): void;
}

export interface IProjectFilter {
  selectedProjectId?: number;
  setProject(id?: number): void;
}
