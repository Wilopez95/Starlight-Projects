import { IBaseSelect, ISelectOption, ISelectOptionGroup } from '../types';

export interface IAutocomplete extends IBaseSelect {
  configs: IAutocompleteConfig[];
  search?: string;
  minSearchLength?: number;
  background?: React.FC<{ expanded: boolean }>;
  selectedValue?: string;
  value?: string | ISelectOption[] | null;
  isMulti?: boolean;
  onSearchChange(name: string, newValue: string): void;
  onRequest(search: string): Promise<AutocompleteData>;
  onClear?(): void;
  onChange?(value: AutocompleteData): void;
}

export type AutocompleteData = unknown[] | Record<string, unknown[]> | null;

export interface IAutocompleteConfig extends Omit<ISelectOptionGroup, 'options'> {
  name: string;
  template: React.ReactElement;
  onSelect(data: unknown): void;
  isOptionDisabled?(data: unknown): boolean;
}

export interface IAutocompleteOptionGroupData extends IAutocompleteConfig {
  options: unknown[];
}
