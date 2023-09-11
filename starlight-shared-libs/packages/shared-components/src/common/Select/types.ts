import { Colors } from '../../theme/baseTypes';
import { InputContainerSize } from '../BaseInput/InputContainer/types';

export type SelectValue = string | number;

export interface ISelectOption {
  value: SelectValue;
  label: string;
  subTitle?: string;
  disabled?: boolean;
  hint?: string | null;
  COEHint?: boolean;
  description?: string;
  badge?: {
    text: string;
    color?: Colors;
    borderRadius?: number;
  };
}

export interface ISelectOptionGroup {
  options: ISelectOption[];
  label?: string;
  image?: React.ReactElement;
  footer?: React.ReactNode;
  showFooterIfNoOption?: boolean;
  onFooterClick?(): void;
}

export type SelectOptionsData = ISelectOption[] | ISelectOptionGroup[];

export interface IBaseSelect {
  name: string;
  className?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  label?: string | React.ReactNode;
  error?: string | string[] | false;
  noErrorMessage?: boolean;
  disabled?: boolean;
  nonClearable?: boolean;
  size?: InputContainerSize;
  noOptionsMessage?: string;
}

export interface IBaseSelectInput extends IBaseSelect {
  options: SelectOptionsData;
  searchInputValue?: string;
  searchable?: boolean;
  exactSearch?: boolean;
}
