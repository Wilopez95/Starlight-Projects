export interface IGetJobSiteSearchQueryData {
  searchQuery: string | undefined;
}
export interface IGetJobSiteSearchQuery {
  data: IGetJobSiteSearchQueryData;
}

export interface IGetCustomerType {
  customerGroupId: number | undefined;
  prepaid: boolean | undefined;
  onAccount: boolean | undefined;
}
