import { IEntity } from './entity';

export interface IProject extends IEntity {
  customerJobSiteId: number;
  generatedId: string;
  description: string;
  poRequired: boolean;
  permitRequired: boolean;
  startDate: Date | null;
  endDate: Date | null;
}
