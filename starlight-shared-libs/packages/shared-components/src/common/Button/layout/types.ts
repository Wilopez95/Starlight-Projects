import { ButtonVariant } from '../types';

export interface IButtonLayout {
  type?: 'submit' | 'reset' | 'button';
  size?: 'medium' | 'large';
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  full?: boolean;
  borderless?: boolean;
  loading?: boolean;
  onClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, value?: number | string): void;
}
