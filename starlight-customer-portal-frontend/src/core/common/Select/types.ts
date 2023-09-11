export type SelectValue = string | number;

export interface ISelectOption {
  value: SelectValue;
  label: string;
  subTitle?: string;
  disabled?: boolean;
  hint?: string | null;
  COEHint?: boolean;
}

export interface ISelectOptionGroup {
  options: ISelectOption[];
  label?: string;
  image?: React.ReactElement;
  footer?: React.ReactNode;
  onFooterClick?(): void;
}

export type InputContainerSize = 'medium' | 'large' | 'normal';

export type SelectOptionsData = ISelectOption[] | ISelectOptionGroup[];

export interface IBaseSelect {
  name: string;
  options: SelectOptionsData;
  className?: string;
  id?: string;
  placeholder?: string;
  label?: string | React.ReactNode;
  error?: string | string[] | false;
  noErrorMessage?: boolean;
  nonClearable?: boolean;
  disabled?: boolean;
  searchInputValue?: string;
  searchable?: boolean;
  exactSearch?: boolean;
  ariaLabel?: string;
}
