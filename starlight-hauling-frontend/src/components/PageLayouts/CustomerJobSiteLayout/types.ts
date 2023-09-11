export type CustomerJobSiteLayoutParams = {
  jobSiteId?: string;
};

export interface ICustomerJobSiteLayout {
  search: string;
  projectId?: number;
  onProjectSelect(id?: number): void;
}
