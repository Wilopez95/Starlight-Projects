import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { IJobSite } from '@root/types';

export const sanitizeJobSite = (jobSite: IJobSiteData | IJobSite) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  delete jobSite.address.id;
};
