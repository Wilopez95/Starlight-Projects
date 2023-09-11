export type InputSize = 'full' | 'three-quarter' | 'half' | 'quarter';

export interface IInputLayout {
  offsetLeft?: boolean;
  offsetRight?: boolean;
  size?: InputSize;
}
