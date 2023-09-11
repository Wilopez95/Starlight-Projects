import { ITextInput } from '@starlightpro/shared-components';

export interface IDebouncedTextInput extends ITextInput {
  debounceTime?: number;
  noContext?: boolean;
  onDebounceChange(value: string): void;
}
