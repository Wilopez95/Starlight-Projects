import type { IDebouncedTextInput } from '../DebouncedTextInput/types';
import { IOptionItem } from '../Dropdown/components/OptionItem/types';

import type { AutocompleteConfigType } from './AutocompleteConfig/types';

export interface IAutocomplete extends Omit<IDebouncedTextInput, 'onDebounceChange'> {
  value: string;
  children:
    | React.ReactElement<AutocompleteConfigType>
    | React.ReactElement<AutocompleteConfigType>[];
  businessUnitId?: string;
  dropdownClassName?: string;
  searchIcon?: boolean;
  background?: React.FC<{ expanded: boolean }>;
  size?: 'small' | 'medium' | 'large';
  minSearch?: number;
  noContext?: boolean;
  onRequest(search: string, businessUnitId?: string): Promise<AutocompleteData>;
  onClear?(): void;
}

export type AutocompleteData = unknown[] | Record<string, unknown[]> | null;

export interface AutocompleteChildrenGeneratorProps {
  template: React.ReactElement;
  name: string;
  showFooterIfEmpty: boolean;
  footerTemplate?: React.ReactElement;
}

export type AutocompleteOptionGroupGenerator = (
  config: AutocompleteChildrenGeneratorProps,
) => React.ReactElement<IOptionItem>[] | null;

export interface IAutocompleteContext {
  loading: boolean;
  optionItemsGenerator: AutocompleteOptionGroupGenerator;
  onHide(): void;
  onShow(): void;
  onClear(): void;
}
