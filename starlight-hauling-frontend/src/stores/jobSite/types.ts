import { type AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { IJobSiteData } from '@root/components/forms/JobSite/types';

export type JobSiteStoreSortType = 'id' | 'name' | 'state' | 'zip' | 'city';

export type GetCountOptions = {
  filterData?: AppliedFilterState;
  query?: string;
};

export interface IJobSiteRequestParams {
  filterData?: AppliedFilterState;
  query?: string;
}

export interface IJobSiteCustomerRequestParams {
  customerId: number;
  mostRecent?: boolean;
  activeOnly?: boolean;
  limit?: number;
}

export interface IJobSiteCustomerByIdRequestParams {
  customerId: number;
  jobSiteId: number;
}

export interface IJobSiteCreateParams {
  data: IJobSiteData;
  linkTo?: number;
  filterData?: AppliedFilterState;
  query?: string;
}
