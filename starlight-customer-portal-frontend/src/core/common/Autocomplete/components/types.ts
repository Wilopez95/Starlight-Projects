export interface IAutocompleteOption<T> {
  redirectPath?: string;
  onClick(item: T): void;
}
