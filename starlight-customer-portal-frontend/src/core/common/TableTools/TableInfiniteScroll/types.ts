export interface ITableInfiniteScroll {
  loaded: boolean;
  loading: boolean;
  onLoaderReached(): void;
}
