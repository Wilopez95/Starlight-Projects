export interface ITableSearch {
  initialSearchValue?: string;
  numericOnly?: boolean;
  placeholder?: string;

  onSearch?(newSearch: string): void;
}
