interface GenericType<T> {
  [key: string]: T[];
}

export type IESSearch<T> = GenericType<T> & {
  total: number;
  length: number;
};
export interface IFiltersES {
  [key: string]: string;
}
export interface IMustFilter {
  [key: string]: string | number | boolean;
}
export interface IMatch {
  match: IMustFilter;
}
export interface ITerms {
  [key: string]: string[] | number[];
}
export interface IFilters {
  terms: ITerms;
}

export interface IBool {
  must: IMatch[];
  filter?: IFilters[];
}
export interface ISearchParams {
  limit?: number;
  skip?: number;
  query?: string | null;
  quickSearch?: boolean;
  sort?: ISortES[];
  bool?: IBool;
}

export interface ISortES {
  [key: string]: string | string[];
}

export interface IESCount {
  count?: number;
  status?: string | number | boolean;
}

export interface ICountTemplate {
  query?: ISearchParams;
}

export interface ICountParams {
  value?: string | number | boolean;
  query?: ICountTemplate;
}
