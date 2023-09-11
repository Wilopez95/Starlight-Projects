import { ReactNode } from 'react';
import {
  CurrencyInputOnChangeValues,
  IntlConfig,
} from 'react-currency-input-field/dist/components/CurrencyInputProps';
import { TextAlign } from '../Typography/types';

//export type TextInputElement = HTMLInputElement;

export interface ICurrencyInputField {
  //extends IBaseInput<string | number | null> {
  name: string;

  id?: string;
  label?: ReactNode;
  error?: object | string | Error | boolean;
  errorAlign?: TextAlign;
  textAlign?: TextAlign | string;
  noError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  wrapClassName?: string;

  value: string | number | readonly string[] | undefined;

  placeholder?: string;
  ariaLabel?: string;
  type?: 'text' | 'number';
  limits?: {
    min?: number;
    max?: number;
  };
  lengthLimits?: {
    min?: number;
    max?: number;
  };
  className?: string;
  inputContainerClassName?: string;
  half?: boolean;
  countable?: boolean;
  borderError?: boolean;
  reverse?: boolean;
  fixedLength?: number;
  confirmed?: boolean;
  // I think CurrencyInput uses the onChange behind the scenes. Don't want to overwrite fucntionality
  // onChange(e: React.ChangeEvent<TextInputElement>): void;
  // onBlur?(e: React.FocusEvent<TextInputElement>): void;
  // onFocus?(e: React.FocusEvent<TextInputElement>): void;
  // onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
  // onKeyDown?(e: React.KeyboardEvent<TextInputElement>): void;
  // onClick?(e: React.MouseEvent<TextInputElement> | React.MouseEvent<HTMLInputElement>): void;
  onClearError?(): void;
  prefix?: string;
  allowDecimals?: boolean;
  allowNegativeValue?: boolean;
  defaultValue?: number;
  decimalSeparator?: string;
  decimalsLimit?: number;
  decimalScale?: number;
  groupSeparator?: string;
  fixedDecimalLength?: number;
  onValueChange?: (
    value: string | undefined,
    name?: string,
    values?: CurrencyInputOnChangeValues,
  ) => void;
  onChange?: (e: any) => void;
  onClearError?: () => void;
  suffix?: string;
  intlConfig?: IntlConfig;
  groupSeperator?: string;
  step?: number;
  maxLength?: number;
}
