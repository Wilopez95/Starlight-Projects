import { Colors } from '../../theme/baseTypes';
import { SvgComponent } from '../../types/base';

export interface IButton extends IBaseButton<string | number> {
  buttonRef?: React.Ref<HTMLButtonElement>;
  loading?: boolean;
}

export type ButtonVariant =
  | Colors
  | 'conversePrimary'
  | 'converseSuccess'
  | 'converseInformation'
  | 'converseAlert'
  | 'none';
export type ButtonType = 'submit' | 'reset' | 'button';
export type ButtonSize = 'medium' | 'large';

export interface IBaseButton<T> {
  type?: ButtonType;
  iconLeft?: SvgComponent;
  iconRight?: SvgComponent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  value?: number | string;
  children?: T | React.ReactNode;
  className?: string;
  disabled?: boolean;
  to?: string;
  full?: boolean;
  borderless?: boolean;
  onClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, value?: number | string): void;
}
