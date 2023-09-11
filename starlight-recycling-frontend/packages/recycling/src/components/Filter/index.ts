import React from 'react';

export { default as CommonFilter } from './CommonFilter';
export { default as JobSiteFilter } from './JobSiteFilter';
export { default as CustomerJobSiteFilter } from './CustomerJobSiteFilter';
export { default as FilterSearchValueField } from './Fields/FilterSearchValueField';

export interface CommonFilterBaseProps {
  name: string;
}

export interface SearchFieldOption {
  label: string;
  value: unknown;
}

export interface BaseSearchFieldProps {
  multiple?: boolean;
  value?: SearchFieldOption['value'] | SearchFieldOption['value'][];
  className?: string;
  inputClassName?: string;
  disableClearable?: boolean;
  renderTags?(): React.ReactNode;
  onChange(value?: SearchFieldOption | SearchFieldOption[]): void;
  loading?: boolean;
  onInputChange?(
    event: React.ChangeEvent<HTMLInputElement>,
    value: string,
    reason: 'input' | 'reset' | 'clear',
  ): void;
  filterOptions?(options: SearchFieldOption[], state: any): SearchFieldOption[];
}

export interface FilterFormValues {
  fields: Array<{ field: string; value?: unknown | unknown[] }>;
}
