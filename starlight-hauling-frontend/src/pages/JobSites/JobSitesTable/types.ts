import { JobSite } from '@root/stores/entities';

export interface IJobSitesTable {
  onSelect(jobSite: JobSite): void;
}

export interface IJobSitesHeader {
  onSort(): void;
}
