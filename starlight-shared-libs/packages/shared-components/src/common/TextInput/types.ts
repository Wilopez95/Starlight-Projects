import type { IBaseInput, SvgComponent } from '../../types/base';
import type { TextAlign } from '../Typography/types';

export type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

export interface ITextInput extends IBaseInput<string | number | null> {
  errorAlign?: TextAlign;
  inputTextAlign?: TextAlign;
  placeholder?: string;
  ariaLabel?: string;
  area?: boolean;
  type?: 'text' | 'password' | 'hidden' | 'email' | 'number';
  limits?: {
    min?: number;
    max?: number;
  };
  lengthLimits?: {
    min?: number;
    max?: number;
  };
  icon?: SvgComponent;
  rightIcon?: SvgComponent | ((props: unknown) => void);
  autoComplete?:
    | 'true'
    | 'off'
    | 'name'
    | 'email'
    | 'username'
    | 'new-password'
    | 'current-password';
  wrapClassName?: string;
  className?: string;
  inputContainerClassName?: string;
  half?: boolean;
  countable?: boolean;
  borderError?: boolean;
  reverse?: boolean;
  fixedLength?: number;
  confirmed?: boolean;
  onChange(e: React.ChangeEvent<TextInputElement>): void;
  onRightImageClick?(e: React.MouseEvent<HTMLOrSVGElement>): void;
  onBlur?(e: React.FocusEvent<TextInputElement>): void;
  onFocus?(e: React.FocusEvent<TextInputElement>): void;
  onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
  onKeyDown?(e: React.KeyboardEvent<TextInputElement>): void;
  onClick?(e: React.MouseEvent<TextInputElement> | React.MouseEvent<HTMLInputElement>): void;
  onClearError?(): void;
}
