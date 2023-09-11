import { AutocompleteProps as AutocompletePropsType } from './Autocomplete';

export { default } from './Autocomplete';

export type AutocompleteProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = AutocompletePropsType<T, Multiple, DisableClearable, FreeSolo>;
