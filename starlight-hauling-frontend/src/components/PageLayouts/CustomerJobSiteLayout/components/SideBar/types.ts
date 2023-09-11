export interface IJobSiteSideBar {
  search: string;
  buildJobSiteUrl(jobSiteId: string | number): string;
  onClick(): void;
}
