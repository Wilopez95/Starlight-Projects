export interface ITableInfiniteScroll {
  loaded: boolean;
  loading: boolean;
  initialRequest?: boolean;
  onLoaderReached(): void;
}
